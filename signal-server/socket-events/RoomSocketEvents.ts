import { injectable } from "inversify";
import SocketEvents from "./SocketEvents";

@injectable()
export default class RoomSocketEvents extends SocketEvents {
  public register() {
    this.socket.on("presenting", ({ room, streamType }) => {
      this.socket.user.presenting = true;
      this.getUsersInRoom(room).then((users) => {
        users.forEach((user) => {
          this.socketServer.to(this.socket.id).emit("watcher", {
            streamType,
            id: user.id,
          });
        });
      });
    });

    this.socket.on("broadcasting", ({ room, streamType }) => {
      this.socket.user.broadcasting = true;

      this.getUsersInRoom(room).then((users) => {
        users.forEach((user) => {
          if (user.id !== this.socket.id && user.broadcasting) {
            this.socketServer.to(user.id).emit("watcher", {
              streamType,
              id: this.socket.id,
            });
          }
          this.socketServer.to(this.socket.id).emit("watcher", {
            streamType,
            id: user.id,
          });
        });
      });
    });

    this.socket.on("pre-join", ({ user, room }) => {
      user.id = this.socket.id;
      this.socket.user = user;
      this.socket.join(`pre-${room}`);
      this.getUsersInRoom(room).then((users) => {
        this.socketServer.to(this.socket.id).emit(`${room}:here`, users);
      });
    });

    this.socket.on("join", ({ room }) => {
      let user = this.socket.user;
      this.socket.leave(`pre-${room}`);
      this.socket.join(room);

      this.socket.to(`pre-${room}`).emit(`${room}:joining`, user);
      this.socket.to(room).emit(`${room}:joining`, user);
      this.getUsersInRoom(room).then((users) => {
        this.socketServer.to(this.socket.id).emit(`${room}:here`, users);
      });
    });

    this.socket.on("leave", ({ room }) => {
      this.socket.leave(room);
    });

    this.socket.on("mute", () => {
      this.getJoinedRooms().forEach((room) => {
        this.socket.user.muted = true;
        this.socket.to(`pre-${room}`).emit(`mute`, this.socket.user);
        this.socket.to(room).emit(`mute`, this.socket.user);
      });
    });

    this.socket.on("unmute", () => {
      this.socket.user.muted = false;
      this.getJoinedRooms().forEach((room) => {
        this.socket.to(`pre-${room}`).emit(`unmute`, this.socket.user);
        this.socket.to(room).emit(`unmute`, this.socket.user);
      });
    });

    this.socket.on("disconnecting", () => {
      this.getJoinedRooms().forEach((room) => {
        this.socket.to(`pre-${room}`).emit(`${room}:leaving`, this.socket.user);
        this.socket.to(room).emit(`${room}:leaving`, this.socket.user);
      });
    });
  }
}
