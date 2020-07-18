import Hashing from "../Hashing";
import { Request, Response } from "express";
import { inject } from "inversify";
import RoomModel from "../models/RoomModel";
import Bindings from "../constants/Bindings";
import RouteError from "../errors/RouteError";
import Router, { Prefix, Post } from "./../Router";
import DatabaseConnection from "../database/DatabaseConnection";

@Prefix("/api/rooms")
export default class RoomRoutes extends Router {
  private hashing: Hashing;
  private roomModel: RoomModel;
  private db: DatabaseConnection;
  constructor(
    @inject(Bindings.App) app,
    @inject(Bindings.Database) db,
    @inject(Bindings.Hashing) hashing,
    @inject(Bindings.Models.Room) roomModel,
  ) {
    super(app);
    this.db = db;
    this.hashing = hashing;
    this.roomModel = roomModel;
  }

  @Post("/:roomCode")
  public async get(request: Request, response: Response) {
    let roomCode = request.params.roomCode;

    if (request.cookies[roomCode]) {
      let room = await this.roomModel
        .where("id", "=", request.cookies[roomCode])
        .find();

      if (room) {
        return room;
      }
    }

    let password = request.body.password;
    if (!password) {
      throw new RouteError(422, "Room requires a password.");
    }
    let parsedRoomCode = this.hashing
      .decodeHashId(roomCode.replace(/-/g, ""))
      .toString();

    let room = await this.roomModel.where("id", "=", parsedRoomCode).find();

    if (!room) {
      throw new RouteError(404, "Cannot find room.");
    }

    if (this.hashing.verify(password, room.password)) {
      response.cookie(roomCode, room.id, {
        httpOnly: true,
        domain: "localhost",
      });
      delete room.id;
      delete room.password;

      return room;
    }

    throw new RouteError(401, "Invalid Password.");
  }

  @Post("/")
  public async post(request: Request, response: Response) {
    let password = request.body.password;
    if (!password) {
      throw new RouteError(422, "Room requires a password");
    }

    let room = await this.roomModel.create({
      name: request.body.name || new Date().toISOString(),
      password: this.hashing.create(password),
    });

    delete room.password;

    response.cookie(room.code, room.id, {
      httpOnly: true,
      domain: "localhost",
    });

    delete room.id;

    return room;
  }
}
