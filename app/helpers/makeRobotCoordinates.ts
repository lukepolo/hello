import { RobotCoordinates } from "@app/interfaces/RobotCoordinates";

export default function makeRobotCoordinates(
  event: MouseEvent,
  element: HTMLVideoElement,
): RobotCoordinates {
  return {
    width: element.getBoundingClientRect().width,
    height: element.getBoundingClientRect().height,
    y: event.clientY - element.getBoundingClientRect().top,
    x: event.clientX - element.getBoundingClientRect().left,
  };
}
