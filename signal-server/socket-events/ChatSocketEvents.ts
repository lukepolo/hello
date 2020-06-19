import { injectable } from "inversify";
import SocketEvents from "./SocketEvents";
import { Message } from "../../app/types/Message";

@injectable()
export default class ChatSocketEvents extends SocketEvents {
  public register() {
    this.socket.on("joinChat", ({ room }) => {
      this.socket.join(`${room}:chat`);
      this.database
        .query("SELECT * FROM messages WHERE room = ?", room)
        .then((messages: Array<Message>) => {
          this.socketServer
            .to(this.socket.id)
            .emit(`${room}:chat:here`, messages);
        });
    });

    this.socket.on("sendMessage", ({ room, message }) => {
      this.database
        .insert("messages", <Message>{
          room,
          content: message,
          author: this.socket.user.name,
        })
        .then((message) => {
          this.socketServer.to(room).emit(`${room}:chat:message`, message);
        });
    });
  }
}
