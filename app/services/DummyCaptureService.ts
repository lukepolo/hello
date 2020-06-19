import { injectable } from "inversify";

@injectable()
export default class DummyCaptureService {
  public capture({ width = 640, height = 480 } = {}): MediaStream {
    let silence = () => {
      let ctx = new AudioContext(),
        oscillator = ctx.createOscillator();
      let dst = oscillator.connect(ctx.createMediaStreamDestination());
      oscillator.start();
      // @ts-ignore
      return Object.assign(dst.stream.getAudioTracks()[0], {
        enabled: false,
      });
    };

    let black = () => {
      let canvas = Object.assign(document.createElement("canvas"), {
        width,
        height,
      });
      canvas.getContext("2d").fillRect(0, 0, width, height);
      // @ts-ignore
      let stream = canvas.captureStream();
      return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    };

    return new MediaStream([black(), silence()]);
  }
}
