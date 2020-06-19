import { Message } from "@app/types/Message";
import { injectable, inject } from "inversify";

@injectable()
export default class ChatService {
  private broadcastService;

  private room;
  private messages: Array<Message> = [];
  private messageCallback = (message) => {
    this.messages.push(message);
  };

  constructor(@inject("BroadcastService") broadcastService) {
    this.broadcastService = broadcastService;
  }

  public join(room): Promise<Array<Message>> {
    this.room = room;
    return new Promise((resolve, reject) => {
      this.broadcastService.listen(`${room}:chat:here`, (messages) => {
        this.messages = messages;
        resolve(this.messages);
      });
      this.broadcastService.emit("joinChat", { room });
      this.broadcastService.listen(`${this.room}:chat:message`, (message) => {
        this.messageCallback(message);
      });
      setTimeout(() => {
        reject("Unable to retrieve message");
      }, 5000);
    });
  }

  public onMessage(callback: (message: any) => void) {
    this.messageCallback = callback;
  }

  public async send({ message }) {
    this.broadcastService.emit("sendMessage", {
      message,
      room: this.room,
    });
  }
}
