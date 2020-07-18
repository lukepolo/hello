import Model, { Table } from "./../Model";
import { Room } from "../../app/types/Room";

@Table("rooms")
export default class RoomModel extends Model<Room> {}
