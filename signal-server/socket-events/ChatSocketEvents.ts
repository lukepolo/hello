import { inject, injectable } from "inversify";
import SocketEvents from "./SocketEvents";
import { Message } from "../../app/types/Message";
import MessageModel from "../models/MessageModel";
import Bindings from "../constants/Bindings";

@injectable()
export default class ChatSocketEvents extends SocketEvents {
  public messageModel: MessageModel;

  constructor(
    @inject(Bindings.Models.Message) messageModel,
    @inject(Bindings.SocketServer) socketServer,
  ) {
    super(socketServer);
    this.messageModel = messageModel;
  }

  public register() {
    this.socket.on("joinChat", ({ room }) => {
      this.socket.join(`${room}:chat`);
      this.messageModel
        .where("room", "=", room)
        .get()
        .then((messages: Array<Message>) => {
          this.socketServer
            .to(this.socket.id)
            .emit(`${room}:chat:here`, messages);
        });
    });

    this.socket.on("sendMessage", ({ room, message }) => {
      this.messageModel
        .create({
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
