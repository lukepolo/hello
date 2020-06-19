import { Server, Socket } from "socket.io";
import { injectable, inject } from "inversify";
import { User } from "../../app/interfaces/User";
import DatabaseConnection from "../database/DatabaseConnection";
import Bindings from "../constants/Bindings";

declare module "socket.io" {
  interface Socket {
    user: User;
  }
}

@injectable()
export default abstract class SocketEvents {
  protected socketServer: Server;
  protected _socket: Socket;
  protected database: DatabaseConnection;

  constructor(
    @inject(Bindings.Database) database,
    @inject(Bindings.SocketServer) socketServer,
  ) {
    this.database = database;
    this.socketServer = socketServer;
  }

  public getJoinedRooms(): Array<string> {
    return Object.keys(this.socket.rooms).slice(1);
  }

  get socket(): Socket {
    if (!this._socket) {
      throw "You must set the socket.";
    }
    return this._socket;
  }

  public setSocket(socket: Socket) {
    this.socket = socket;
    return this;
  }

  set socket(value: Socket) {
    this._socket = value;
  }

  public getUsersInRoom(room: string): Promise<Array<any>> {
    let users = [];
    return new Promise((resolve) => {
      this.socketServer.in(room).clients((error, clients) => {
        clients.map((clientId) => {
          let clientSocket = this.socketServer.sockets.connected[clientId];
          if (
            clientId !== this.socket.id &&
            clientSocket &&
            clientSocket.user
          ) {
            users.push(clientSocket.user);
          }
        });
        resolve(users);
      });
    });
  }
}
