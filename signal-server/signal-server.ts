import "reflect-metadata";
import { Express } from "express";
import container from "./Container";
import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import Bindings from "./constants/Bindings";
import RoomRoutes from "./routes/RoomRoutes";
import DatabaseConnection from "./database/DatabaseConnection";
import ChatSocketEvents from "./socket-events/ChatSocketEvents";
import RoomSocketEvents from "./socket-events/RoomSocketEvents";
import RemoteControlSocketEvents from "./socket-events/RemoteControlSocketEvents";
import RtcPeerConnectionSocketEvents from "./socket-events/RtcPeerConnectionSocketEvents";

const port = process.env.PORT || 3000;

class App {
  protected app;

  constructor() {
    this.app = container.get<Express>(Bindings.App);
    this.migrate().then(() => {
      this.startWebSocketServer();
      this.setupRoutes();
      this.startServer();
    });
  }

  public async migrate() {
    await container.get<DatabaseConnection>(Bindings.Database).migrate();
  }

  public setupRoutes() {
    container.get<RoomRoutes>(Bindings.RoomRoutes);
  }

  public startServer() {
    container.get<HttpServer>(Bindings.HttpServer).listen(port, () => {
      console.log("listening on", port);
    });
  }

  public startWebSocketServer() {
    container
      .get<Server>(Bindings.SocketServer)
      .on("connection", (socket: Socket) => {
        container
          .get<ChatSocketEvents>(Bindings.ChatSocketEvents)
          .setSocket(socket)
          .register();
        container
          .get<RoomSocketEvents>(Bindings.RoomSocketEvents)
          .setSocket(socket)
          .register();
        container
          .get<RemoteControlSocketEvents>(Bindings.RemoteControlSocketEvents)
          .setSocket(socket)
          .register();
        container
          .get<RtcPeerConnectionSocketEvents>(
            Bindings.RtcPeerConnectionSocketEvents,
          )
          .setSocket(socket)
          .register();
      });
  }
}

new App();
