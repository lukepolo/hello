import { Socket } from "socket.io";
import { injectable, inject } from "inversify";
import ConfigService from "varie/lib/config/ConfigService";

@injectable()
export default class BroadcastService {
  private socket: Socket;
  protected $configService: ConfigService;

  constructor(@inject("ConfigService") configService) {
    this.$configService = configService;
    this.connect();
  }

  public emit(event, ...args): void {
    this.socket.emit(event, ...args);
  }

  public listen(event, callback: (...args: any) => void): void {
    this.socket.on(event, callback);
  }

  public removeListener(event, callback: (...args: any) => void) {
    this.socket.off(event, callback);
  }

  public connect(): Socket {
    this.socket = require("socket.io-client/dist/socket.io.js").connect(
      this.$configService.get("signal-server.host", "host"),
    );
    this.socket.on("connect", () => {
      localStorage.setItem("socketId", this.socket.id);
    });
    return this.socket;
  }
}
