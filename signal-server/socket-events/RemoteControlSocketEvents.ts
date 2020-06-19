import { injectable } from "inversify";
import SocketEvents from "./SocketEvents";

@injectable()
export default class RemoteControlSocketEvents extends SocketEvents {
  public register() {
    this.socket.on("leftClick", (event) => {
      this.socket.broadcast.emit("leftClick", event);
    });

    this.socket.on("rightClick", (event) => {
      this.socket.broadcast.emit("rightClick", event);
    });

    this.socket.on("mouseDown", (event) => {
      this.socket.broadcast.emit("mouseDown", event);
    });

    this.socket.on("dragMouse", (event) => {
      this.socket.broadcast.emit("dragMouse", event);
    });

    this.socket.on("mouseUp", (event) => {
      this.socket.broadcast.emit("mouseUp", event);
    });

    this.socket.on("scroll", (event) => {
      this.socket.broadcast.emit("scroll", event);
    });

    this.socket.on("keyDown", (event) => {
      this.socket.broadcast.emit("keyDown", event);
    });

    this.socket.on("keyUp", (event) => {
      this.socket.broadcast.emit("keyUp", event);
    });
  }
}
