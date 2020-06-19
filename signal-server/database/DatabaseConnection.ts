import fs from "fs";
import path from "path";
import Snowflake from "snowflake-id";
import { injectable } from "inversify";
import cassandra from "cassandra-driver";

@injectable()
export default class DatabaseConnection {
  private client;
  private idGenerator;

  constructor() {
    this.idGenerator = new Snowflake({
      // Make as small as possible to start out with
      offset: (2020 - 1970) * 31536000 * 1000,
    });

    const authProvider = new cassandra.auth.PlainTextAuthProvider(
      "cassandra",
      "cassandra",
    );

    this.client = new cassandra.Client({
      authProvider,
      contactPoints: ["127.0.0.1"],
      keyspace: "hello",
      localDataCenter: "datacenter1",
    });
  }

  public async query(query: string, ...params: Array<string>) {
    return await this.client.execute(query, params).then((results) => {
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

  public async migrate() {
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
