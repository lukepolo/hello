import robot from "robotjs";
import { ipcMain } from "electron";
import { KeyDictionary } from "../constants/KeyDictionary";
import { RobotEventInterface } from "@app/interfaces/RobotEventInterface";

export default class KeyEvents implements RobotEventInterface {
  public register() {
    ipcMain.on("keyDown", (event, key: string) => {
      try {
        robot.keyToggle(this.getKey(key), "down");
      } catch (error) {
        console.log("error", {
          key,
          error,
          convertedKey: this.getKey(key),
        });
      }
    });

    ipcMain.on("keyUp", (event, key: string) => {
      try {
        robot.keyToggle(this.getKey(key), "up");
      } catch (error) {
        console.log("error", {
          key,
          error,
          convertedKey: this.getKey(key),
        });
      }
    });
  }

  private getKey(key: string): string {
    key = key.toLowerCase();

    if (KeyDictionary[key]) {
      key = KeyDictionary[key];
    }

    return key;
  }
}
