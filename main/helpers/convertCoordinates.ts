import robot from "robotjs";
import { RobotCoordinates } from "@app/interfaces/RobotCoordinates";

export default function convertCoordinates(
  coords: RobotCoordinates,
  xy: "x" | "y",
) {
  if (xy === "x") {
    return (robot.getScreenSize().width * coords.x) / coords.width;
  } else if (xy === "y") {
    return (robot.getScreenSize().height * coords.y) / coords.height;
  }
}
