import deepMerge from "deepmerge";
import { injectable } from "inversify";

@injectable()
export default class CameraCaptureService {
  public async capture(
    userConstraints: MediaStreamConstraints = {},
  ): Promise<MediaStream> {
    let defaultConstraints: MediaStreamConstraints = {
      audio: true,
      video: {
        width: {
          min: 1280,
          ideal: 1920,
          max: 3840,
        },
        height: {
          min: 720,
          ideal: 1080,
          max: 2160,
        },
        facingMode: "user",
      },
    };

    const constraints = deepMerge(defaultConstraints, userConstraints);

    return navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream: MediaStream) => {
        return stream;
      });
  }
}
