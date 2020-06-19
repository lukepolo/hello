import { injectable } from "inversify";
import deepMerge from "deepmerge";

@injectable()
export default class MicrophoneCaptureService {
  public async capture(
    userConstraints: MediaTrackConstraintSet = {},
  ): Promise<MediaStream> {
    let defaultAudioConstraints: MediaTrackConstraints = {};
    const audioConstraints = deepMerge(
      defaultAudioConstraints,
      userConstraints,
    );

    return navigator.mediaDevices
      .getUserMedia({
        audio: audioConstraints,
      })
      .then((stream: MediaStream) => {
        return stream;
      });
  }
}
