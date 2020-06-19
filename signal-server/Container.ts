import express from "express";
import { Container } from "inversify";
import Bindings from "./constants/Bindings";
import httpServer, { Server as HttpServer } from "http";
import socketIO, { Server as SocketServer } from "socket.io";
import DatabaseConnection from "./database/DatabaseConnection";
import RoomSocketEvents from "./socket-events/RoomSocketEvents";
import ChatSocketEvents from "./socket-events/ChatSocketEvents";
import RemoteControlSocketEvents from "./socket-events/RemoteControlSocketEvents";
import RtcPeerConnectionSocketEvents from "./socket-events/RtcPeerConnectionSocketEvents";

const container = new Container();

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

const http = new httpServer.Server(express());
container.bind<HttpServer>(Bindings.HttpServer).toConstantValue(http);
container
  .bind<SocketServer>(Bindings.SocketServer)
  .toConstantValue(socketIO(http));

export default container;
