import { ipcRenderer } from "electron";
import { inject, injectable } from "inversify";
import BroadcastService from "@app/services/BroadcastService";
import makeRobotCoordinates from "@app/helpers/makeRobotCoordinates";

@injectable()
export default class RemoteControlService {
  private broadcastService: BroadcastService;

  constructor(@inject("BroadcastService") broadcastService) {
    this.broadcastService = broadcastService;
  }

  private emitDragMouse(element: HTMLVideoElement, event: MouseEvent): void {
    this.broadcastService.emit(
      "dragMouse",
      makeRobotCoordinates(event, element),
    );
  }

  // TODO - mouse movements
  public registerControlEvents(): void {
    this.broadcastService.listen("leftClick", (coords) => {
      ipcRenderer.send("leftClick", coords);
    });

    this.broadcastService.listen("rightClick", (coords) => {
      ipcRenderer.send("rightClick", coords);
    });

    this.broadcastService.listen("mouseDown", (coords) => {
      ipcRenderer.send("mouseDown", coords);
    });

    this.broadcastService.listen("dragMouse", (coords) => {
      console.info("dragMouse");
      ipcRenderer.send("dragMouse", coords);
    });

    this.broadcastService.listen("mouseUp", () => {
      ipcRenderer.send("mouseUp");
    });

    this.broadcastService.listen("scroll", (delta) => {
      ipcRenderer.send("scroll", delta);
    });

    this.broadcastService.listen("keyDown", (key) => {
      ipcRenderer.send("keyDown", key);
    });

    this.broadcastService.listen("keyUp", (key) => {
      ipcRenderer.send("keyUp", key);
    });
  }

  public deregisterControlEvents(): void {}

  public registerListenerEvents(element: HTMLVideoElement): void {
    element.addEventListener("click", (event) => {
      this.broadcastService.emit(
        "leftClick",
        makeRobotCoordinates(event, element),
      );
    });

    element.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      this.broadcastService.emit(
        "rightClick",
        makeRobotCoordinates(event, element),
      );
    });

    element.addEventListener("mousedown", (event) => {
      console.info("mouse down!");
      this.broadcastService.emit(
        "mouseDown",
        makeRobotCoordinates(event, element),
      );
      // element.addEventListener("mousemove", this.emitDragMouse.bind(this, element));
    });

    element.addEventListener("mouseup", () => {
      console.info("mouse UP!");
      this.broadcastService.emit("mouseUp");
      // element.removeEventListener("mousemove", this.emitDragMouse.bind(this, element));
    });

    element.addEventListener("wheel", (event) => {
      this.broadcastService.emit("scroll", {
        x: event.deltaX,
        y: event.deltaY,
      });
    });

    window.addEventListener("keydown", (event) => {
      this.broadcastService.emit("keyDown", event.key);
    });

    window.addEventListener("keyup", (event) => {
      this.broadcastService.emit("keyUp", event.key);
    });
  }

  public deregisterListenerEvents(element: HTMLVideoElement): void {}
}
