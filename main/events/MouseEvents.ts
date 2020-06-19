import robot from "robotjs";
import { ipcMain } from "electron";
import convertCoordinates from "../helpers/convertCoordinates";
import { RobotEventInterface } from "@app/interfaces/RobotEventInterface";

export default class MouseEvents implements RobotEventInterface {
  public register() {
    ipcMain.on("leftClick", (event, coords) => {
      robot.moveMouse(
        convertCoordinates(coords, "x"),
        convertCoordinates(coords, "y"),
      );
    });

    ipcMain.on("rightClick", (event, coords) => {
      robot.moveMouse(
        convertCoordinates(coords, "x"),
        convertCoordinates(coords, "y"),
      );
      robot.mouseClick("right");
    });

    ipcMain.on("mouseDown", (event, coords) => {
      robot.moveMouse(
        convertCoordinates(coords, "x"),
        convertCoordinates(coords, "y"),
      );
      robot.mouseToggle("down");
    });

    ipcMain.on("mouseUp", () => {
      robot.mouseToggle("up");
    });

    ipcMain.on("dragMouse", (event, coords) => {
      console.info("dragMouse IN MAIN");
      robot.dragMouse(
        convertCoordinates(coords, "x"),
        convertCoordinates(coords, "y"),
      );
    });
  }
}
