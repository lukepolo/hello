import Bindings from "./constants/Bindings";
import { inject, injectable } from "inversify";
import DatabaseConnection from "./database/DatabaseConnection";

export const Table = (table: string = ""): ClassDecorator => {
  return (target: any) => {
    Reflect.defineMetadata("table", table, target);
  };
};

@injectable()
export default class Model<T> {
  protected table: string;
  protected db: DatabaseConnection;

  private whereClauses: Array<{
    column: string;
    operator: string;
    value: string;
  }> = [];

  constructor(@inject(Bindings.Database) db) {
    this.db = db;
    this.table = Reflect.getMetadata("table", this.constructor);
  }

  async create(data: T) {
    return this.db.insert(this.table, data);
  }

  public where(column, operator, value) {
    this.whereClauses.push({
      column,
      operator,
      value,
    });
    return this;
  }

  async get(): Promise<Array<T>> {
    let { query, bindings } = this.buildGetQuery();
    return this.db.query(query, bindings);
  }

  async find(): Promise<T> {
    let { query, bindings } = this.buildGetQuery();
    let results = await this.db.query(query, bindings, 1);

    if (results.length > 0) {
      return results[0];
    }
  }

  private buildGetQuery(): {
    query: string;
    bindings: Array<any>;
  } {
    let query = `SELECT * FROM ${this.table}`;
    let bindings = [];
    if (this.whereClauses.length > 0) {
      query = `${query} WHERE`;
      this.whereClauses.forEach((whereClause, index) => {
        bindings.push(whereClause.value);
        query = `${query}${index !== 0 ? " AND" : ""} ${whereClause.column} ${
          whereClause.operator
        } ?`;
      });
    }

    this.whereClauses = [];
    return {
      query,
      bindings,
    };
  }
}
