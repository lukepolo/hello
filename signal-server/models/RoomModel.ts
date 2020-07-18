import Hashids from "hashids";
import { inject } from "inversify";
import Model, { Table } from "./../Model";
import { Room } from "../../app/types/Room";
import Bindings from "../constants/Bindings";

@Table("rooms")
export default class RoomModel extends Model<Room> {
  private hashids;

  constructor(@inject(Bindings.ENV) env, @inject(Bindings.Database) db) {
    super(db);
    this.hashids = new Hashids(env.APP_KEY, 15, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  }

  protected computed = {
    code: (room) => {
      return this.hashids
        .encode(BigInt(room.id))
        .match(/.{1,5}/g)
        .join("-");
    },
  };
}
