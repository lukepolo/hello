export default {
  ENV: Symbol("ENV"),
  App: Symbol("App"),
  Hashing: Symbol("Hashing"),
  Database: Symbol("Database"),
  HttpServer: Symbol("HttpServer"),
  SocketServer: Symbol("SocketServer"),
  ChatSocketEvents: Symbol("ChatSocketEvents"),
  RoomSocketEvents: Symbol("RoomSocketEvents"),
  RemoteControlSocketEvents: Symbol("RemoteControlSocketEvents"),
  RtcPeerConnectionSocketEvents: Symbol("RtcPeerConnectionSocketEvents"),

  RoomRoutes: Symbol("RoomRoutes"),

  Models: {
    Room: Symbol("Room"),
    Message: Symbol("Message"),
  },
};
