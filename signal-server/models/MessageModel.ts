import Model, { Table } from "./../Model";
import { Message } from "../../app/types/Message";

@Table("messages")
export default class MessageModel extends Model<Message> {}
