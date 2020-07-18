import fs from "fs";
import path from "path";
import Snowflake from "snowflake-id";
import cassandra from "cassandra-driver";
import Bindings from "../constants/Bindings";
import { inject, injectable } from "inversify";

@injectable()
export default class DatabaseConnection {
  private env;

  protected client;
  protected idGenerator = new Snowflake({
    // Make as small as possible to start out with
    offset: (2020 - 1970) * 31536000 * 1000,
  });

  constructor(@inject(Bindings.ENV) env) {
    this.env = env;
    this.createClient();
  }

  private createClient() {
    const authProvider = new cassandra.auth.PlainTextAuthProvider(
      this.env.DB_USERNAME,
      this.env.DB_PASSWORD,
    );

    this.client = new cassandra.Client({
      authProvider,
      keyspace: this.env.DB_KEYSPACE,
      localDataCenter: this.env.DB_DATACENTER,
      contactPoints: JSON.parse(this.env.DB_HOSTS),
      protocolOptions: {
        port: this.env.DB_PORT || 9042,
      },
    });
  }

  public async query(query: string, params: Array<any>, limit?: number) {
    return await this.client
      .execute(
        `select * from rooms where id = ? ${limit ? `limit ${limit}` : ""}`,
        params,
        { prepare: true },
      )
      .then((results) => {
        return results.rows;
      });
  }

  public async insert(table: string, data) {
    data.id = this.idGenerator.generate();
    return this.client
      .execute(`INSERT INTO ${table} JSON ?`, [JSON.stringify(data)], {
        prepare: true,
      })
      .then(() => {
        return data;
      });
  }

  public migrationPath = "signal-server/database/migrations";

  public async migrate(): Promise<void> {
    // TODO - super crude , we can make it better
    let migrations = this.getMigrations();
    for (let migrationIndex in migrations) {
      let migration = migrations[migrationIndex];
      let migrationName = migration.name.replace(/_/g, " ");
      await this.client.execute(migration.contents).catch((error) => {
        console.error(`UNABLE TO MIGRATE: ${migration.path}`);
        console.error(error.message);
        process.exit();
      });
      console.info(`MIGRATED ${migrationName}`);
    }
  }

  private getMigrations() {
    return fs
      .readdirSync(path.join(process.cwd(), this.migrationPath))
      .map((file) => {
        return {
          path: file,
          date: file.match(/^\d+/g)[0],
          name: file.match(/(?<=_)[^_].*(?=\.\w+$)/g)[0],
          contents: fs
            .readFileSync(
              path.join(process.cwd(), `${this.migrationPath}/${file}`),
            )
            .toString(),
        };
      })
      .sort((a, b) => {
        return parseInt(a.date) - parseInt(b.date);
      });
  }
}
