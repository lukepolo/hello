import EventEmitter from "events";
import { User } from "@app/interfaces/User";
import { inject, injectable } from "inversify";
import { StreamTypes } from "@app/constants/StreamTypes";
import StreamController from "@app/streams/StreamController";
import BroadcastService from "@app/services/BroadcastService";

// TODO - use transceivers ?
// TODO - https://www.chromestatus.com/feature/6044840062091264
// setStreams when changing camera

@injectable()
export default class RoomStreamingService {
  private user: User;
  private room: string;
  private users: Array<User> = [];

  private broadcastService: BroadcastService;
  private streamController: StreamController;

  // TODO - learn how to type this
  private roomEmitter = new EventEmitter();

  constructor(@inject("BroadcastService") broadcastService) {
    this.broadcastService = broadcastService;
  }

  public getUsers(): Array<User> {
    return this.users;
  }

  public async join(): Promise<void> {
    this.broadcastService.emit("join", {
      room: this.room,
    });

    this.broadcastService.emit("broadcasting", {
      room: this.room,
      streamType: StreamTypes.Broadcasting,
    });
  }

  public leaveRoom(): void {
    this.broadcastService.emit("leave", {
      room: this.room,
    });
  }

  public present(): void {
    this.broadcastService.emit("presenting", {
      room: this.room,
      streamType: StreamTypes.Presenting,
    });
  }

  public async setup(
    room: string,
    user: User,
  ): Promise<{
    room: EventEmitter;
    streamController: StreamController;
  }> {
    this.user = user;
    this.room = room;
    this.broadcastService.emit("pre-join", {
      user,
      room: this.room,
    });
    this.registerRoomListeners();

    this.streamController = $app.make<StreamController>("StreamController");

    this.streamController.on("newViewer", (data) => {
      this.roomEmitter.emit("newViewer", data);
    });

    return {
      room: this.roomEmitter,
      streamController: this.streamController,
    };
  }

  private userLeaving(id: string): void {
    this.users.splice(
      this.users.findIndex((user: User) => {
        return user.id === id;
      }),
      1,
    );

    this.streamController.closeConnection(id);
    this.roomEmitter.emit("viewerLeft", id);
  }

  private registerRoomListeners(): void {
    this.broadcastService.listen(`${this.room}:here`, (users) => {
      this.users = Object.assign([], users);
      this.roomEmitter.emit("here", users);
    });
    this.broadcastService.listen(`${this.room}:joining`, (user) => {
      this.users.push(user);
      this.roomEmitter.emit("joining", user);
    });
    this.broadcastService.listen(
      `${this.room}:leaving`,
      this.userLeaving.bind(this),
    );
    this.broadcastService.listen("mute", (user) => {
      this.roomEmitter.emit("mute", user);
    });
    this.broadcastService.listen("unmute", (user) => {
      this.roomEmitter.emit("unmute", user);
    });
  }
}
