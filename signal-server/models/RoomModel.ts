import Hashing from "../Hashing";
import { inject } from "inversify";
import Model, { Table } from "./../Model";
import { Room } from "../../app/types/Room";
import Bindings from "../constants/Bindings";

@Table("rooms")
export default class RoomModel extends Model<Room> {
  protected hashing: Hashing;

  constructor(
    @inject(Bindings.Hashing) hashing,
    @inject(Bindings.Database) db,
  ) {
    super(db);
    this.hashing = hashing;
  }

  protected computed = {
    code: (room) => {
      return this.hashing
        .encodeAsHashId(room.id)
        .match(/.{1,5}/g)
        .join("-");
    },
  };
}
