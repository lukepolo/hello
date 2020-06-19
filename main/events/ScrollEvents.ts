import robot from "robotjs";
import { ipcMain } from "electron";
import { RobotEventInterface } from "@app/interfaces/RobotEventInterface";

export default class ScrollEvents implements RobotEventInterface {
  public register() {
    ipcMain.on("scroll", (event, delta) => {
      robot.scrollMouse(delta.x, delta.y);
    });
  }
}
