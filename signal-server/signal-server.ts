import "reflect-metadata";
import container from "./Container";
import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import Bindings from "./constants/Bindings";
import DatabaseConnection from "./database/DatabaseConnection";
import ChatSocketEvents from "./socket-events/ChatSocketEvents";
import RoomSocketEvents from "./socket-events/RoomSocketEvents";
import RemoteControlSocketEvents from "./socket-events/RemoteControlSocketEvents";
import RtcPeerConnectionSocketEvents from "./socket-events/RtcPeerConnectionSocketEvents";

const port = process.env.PORT || 3000;

container
  .get<DatabaseConnection>(Bindings.Database)
  .migrate()
  .then(() => {
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

    container.get<HttpServer>(Bindings.HttpServer).listen(port, () => {
      console.log("listening on", port);
    });
  });
