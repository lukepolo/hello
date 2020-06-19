import { injectable } from "inversify";
import SocketEvents from "./SocketEvents";

@injectable()
export default class RtcPeerConnectionSocketEvents extends SocketEvents {
  public register() {
    this.socket.on("candidate", (id, streamType, candidate) => {
      this.socket
        .to(id)
        .emit("candidate", this.socket.id, streamType, candidate);
    });

    this.socket.on("offer", (id, streamType, offer) => {
      this.socket.to(id).emit("offer", this.socket.id, streamType, offer);
    });

    this.socket.on("answer", (id, streamType, offer) => {
      this.socket.to(id).emit("answer", this.socket.id, streamType, offer);
    });
  }
}
