import dotenv from "dotenv";
import { Container } from "inversify";
import express, { Express } from "express";
import Bindings from "./constants/Bindings";
import RoomRoutes from "./routes/RoomRoutes";
import MessageModel from "./models/MessageModel";
import httpServer, { Server as HttpServer } from "http";
import socketIO, { Server as SocketServer } from "socket.io";
import DatabaseConnection from "./database/DatabaseConnection";
import RoomSocketEvents from "./socket-events/RoomSocketEvents";
import ChatSocketEvents from "./socket-events/ChatSocketEvents";
import RemoteControlSocketEvents from "./socket-events/RemoteControlSocketEvents";
import RtcPeerConnectionSocketEvents from "./socket-events/RtcPeerConnectionSocketEvents";
import RoomModel from "./models/RoomModel";
import BodyParser from "body-parser";
import Hashing from "./Hashing";
import cors from "cors";

const container = new Container();

let env = dotenv.config().parsed;
container.bind(Bindings.ENV).toConstantValue(env);
container.bind<Hashing>(Bindings.Hashing).to(Hashing);

container
  .bind<ChatSocketEvents>(Bindings.ChatSocketEvents)
  .to(ChatSocketEvents);
container
  .bind<RoomSocketEvents>(Bindings.RoomSocketEvents)
  .to(RoomSocketEvents);
container
  .bind<DatabaseConnection>(Bindings.Database)
  .to(DatabaseConnection)
  .inSingletonScope();
container
  .bind<RemoteControlSocketEvents>(Bindings.RemoteControlSocketEvents)
  .to(RemoteControlSocketEvents);
container
  .bind<RtcPeerConnectionSocketEvents>(Bindings.RtcPeerConnectionSocketEvents)
  .to(RtcPeerConnectionSocketEvents);

container.bind<RoomRoutes>(Bindings.RoomRoutes).to(RoomRoutes);

container.bind<RoomModel>(Bindings.Models.Room).to(RoomModel);
container.bind<MessageModel>(Bindings.Models.Message).to(MessageModel);

const app = express();

if (env.APP_ENV === "local") {
  app.use(cors());
}

app.use(BodyParser.json());

const http = new httpServer.Server(app);
container.bind<Express>(Bindings.App).toConstantValue(app);
container.bind<HttpServer>(Bindings.HttpServer).toConstantValue(http);
container
  .bind<SocketServer>(Bindings.SocketServer)
  .toConstantValue(socketIO(http));

export default container;
