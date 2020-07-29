import { inject, injectable } from "inversify";
import { DesktopCapturerSource } from "electron";
import { DesktopSources } from "@app/types/DesktopSources";
import OperatingSystemService, { PLATFORMS } from "@app/services/OperatingSystemService";

// TODO - ask for permissions
// https://www.electronjs.org/docs/api/system-preferences#systempreferencesgetmediaaccessstatusmediatype-macos

@injectable()
export default class DesktopCaptureService {
  private operatingSystemService : OperatingSystemService;

  constructor(@inject("OperatingSystemService") operatingSystemService) {
    this.operatingSystemService = operatingSystemService;
  }

  public getSources(
    thumbnailSize: {
      width: number;
      height: number;
    } = {
      width: 150,
      height: 150,
    },
  ): Promise<DesktopSources> {
    let desktopSources: DesktopSources = {
      windows: [],
      screens: [],
    };

    if ($config.get("app.platform") === "app") {
      const { desktopCapturer } = require("electron");
      return desktopCapturer
        .getSources({
          types: ["window", "screen"],
          fetchWindowIcons: true,
          thumbnailSize,
        })
        .then((sources) => {
          sources.forEach((source) => {
            if (source.id.includes("window")) {
              desktopSources.windows.push(source);
            } else if (source.id.includes("screen")) {
              desktopSources.screens.push(source);
            }
          });
          return desktopSources;
        });
    } else {
      alert("web");
    }
  }

  // TODO - running in browser
  public capture(videoElement, source: DesktopCapturerSource, audio = true) {
    // https://www.electronjs.org/docs/api/desktop-capturer#caveats
    // OSX - cannot capture audio
    if (PLATFORMS.MAC === this.operatingSystemService.getOS()) {
      audio = false;
    }

    return navigator.mediaDevices
      .getUserMedia({
        audio: audio
          ? {
              // @ts-ignore
              mandatory: {
                chromeMediaSource: "desktop",
              },
            }
          : false,
        video: {
          // https://www.electronjs.org/docs/api/desktop-capturer
          // To capture video from a source provided by desktopCapturer the constraints passed to navigator.mediaDevices.getUserMedia must include chromeMediaSource: 'desktop', and audio: false.
          // To capture both audio and video from the entire desktop the constraints passed to navigator.mediaDevices.getUserMedia must include chromeMediaSource: 'desktop', for both audio and video, but should not include a chromeMediaSourceId constraint.
          // @ts-ignore
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: source.id,
          },
        },
      })
      .then((stream) => {
        return this.setupVideoStream(videoElement, stream);
      });
  }

  public setupVideoStream(
    videoElement: HTMLVideoElement,
    stream: MediaStream,
  ): MediaStream {
    videoElement.srcObject = stream;
    videoElement.onloadedmetadata = (e) => videoElement.play();

    return stream;
  }
}
