import EventEmitter from "events";
import { Viewer } from "@app/types/Viewer";
import { inject, injectable } from "inversify";
import DeviceService from "@app/services/DeviceService";
import { DeviceTypes } from "@app/constants/DeviceTypes";
import { StreamTypes } from "@app/constants/StreamTypes";
import BroadcastService from "@app/services/BroadcastService";
import { RtcPeerConnections } from "@app/types/RtcPeerConnections";
import CameraCaptureService from "@app/services/CameraCaptureService";

@injectable()
export default class StreamController {
  private localStream: MediaStream;
  private deviceService: DeviceService;
  private broadcastService: BroadcastService;
  private cameraCaptureService: CameraCaptureService;

  private localRtcPeerConnections: RtcPeerConnections = {
    [StreamTypes.Presenting]: {},
    [StreamTypes.Broadcasting]: {},
  };
  private remoteRtcPeerConnections: RtcPeerConnections = {
    [StreamTypes.Presenting]: {},
    [StreamTypes.Broadcasting]: {},
  };

  private rtcConfiguration: RTCConfiguration = {};

  private emitter = new EventEmitter();

  constructor(
    @inject("ConfigService") configService,
    @inject("DeviceService") deviceService,
    @inject("BroadcastService") broadcastService,
    @inject("CameraCaptureService") cameraCaptureService,
  ) {
    this.deviceService = deviceService;
    this.broadcastService = broadcastService;
    this.cameraCaptureService = cameraCaptureService;

    this.rtcConfiguration.iceServers = JSON.parse(
      configService.get("rtc-settings.iceServers", "[]"),
    );

    // TODO - we have different stream types for a reason
    this.registerStreamListeners(StreamTypes.Broadcasting);
  }

  public getStream(): MediaStream {
    return this.localStream;
  }

  public getVideoTrack(): MediaStreamTrack {
    return this.localStream?.getVideoTracks()[0];
  }

  public getAudioTrack(): MediaStreamTrack {
    return this.localStream?.getAudioTracks()[0];
  }

  public on(name, callback): void {
    this.emitter.on(name, callback);
  }

  private emit(event: string, data?: any): void {
    this.emitter.emit(event, data);
  }

  public changeMicrophone(stream): void {
    this.updateTracks([stream.getAudioTracks()[0]], stream);
  }

  public changeCamera(stream): void {
    navigator.mediaDevices.removeEventListener(
      "devicechange",
      this.watchCameraSource.bind(this),
    );
    this.updateTracks(
      [stream.getVideoTracks()[0], stream.getAudioTracks()[0]],
      stream,
    );
    navigator.mediaDevices.addEventListener(
      "devicechange",
      this.watchCameraSource.bind(this),
    );
  }

  private watchCameraSource(): void {
    this.deviceService.getDevices(DeviceTypes.Camera).then((cameras) => {
      let audioTrack = this.localStream.getAudioTracks()[0];
      let videoTrack = this.localStream.getVideoTracks()[0];
      if (
        audioTrack.readyState === "ended" ||
        videoTrack.readyState === "ended"
      ) {
        try {
          this.cameraCaptureService.capture().then((cameraStream) => {
            cameraStream.getAudioTracks()[0].enabled = audioTrack.enabled;
            cameraStream.getVideoTracks()[0].enabled = videoTrack.enabled;
            this.changeCamera(cameraStream);
          });
        } catch {}
      }
    });
  }

  public mute(): void {
    this.broadcastService.emit("mute");
  }

  public unmute(): void {
    this.broadcastService.emit("unmute");
  }

  private updateTracks(
    newTracks: Array<MediaStreamTrack>,
    stream: MediaStream,
  ): void {
    if (!this.localStream) {
      this.localStream = stream;
    } else {
      newTracks.forEach((newTrack) => {
        this.localStream.getTracks().forEach((track) => {
          if (track.kind === newTrack.kind) {
            this.localStream.removeTrack(track);
          }
        });
        this.localStream.addTrack(newTrack);
      });
    }
    this.emit("stream", this.localStream);

    for (let connectionId in this.localRtcPeerConnections[
      StreamTypes.Broadcasting
    ]) {
      newTracks.forEach((track) => {
        this.localRtcPeerConnections[StreamTypes.Broadcasting][connectionId]
          .getSenders()
          .find((sender) => {
            return sender.track.kind === track.kind;
          })
          .replaceTrack(track);
      });
    }
  }

  public closeConnection(id: string): void {
    for (let streamTypeIndex in StreamTypes) {
      let streamType = StreamTypes[streamTypeIndex];
      if (this.localRtcPeerConnections[streamType][id]) {
        this.localRtcPeerConnections[streamType][id].close();
        delete this.localRtcPeerConnections[streamType][id];
      }
      if (this.remoteRtcPeerConnections[streamType][id]) {
        this.remoteRtcPeerConnections[streamType][id].close();
        delete this.remoteRtcPeerConnections[streamType][id];
      }
    }
  }

  private answer(
    id: string,
    streamType: StreamTypes,
    offer: RTCSessionDescription,
  ): void {
    this.localRtcPeerConnections[streamType][id].setRemoteDescription(offer);
  }

  private candidate(
    id: string,
    streamType: StreamTypes,
    candidate: RTCIceCandidate,
  ): void {
    this.localRtcPeerConnections[streamType][id].addIceCandidate(
      new RTCIceCandidate(candidate),
    );
  }

  private handleIceCandidate(
    id: string,
    streamType: StreamTypes,
    event: RTCIceCandidate,
  ): void {
    if (event.candidate) {
      this.broadcastService.emit("candidate", id, streamType, event.candidate);
    }
  }

  private offer(
    id: string,
    streamType: StreamTypes,
    offer: RTCSessionDescription,
  ): void {
    let rtcPeerConnection = (this.remoteRtcPeerConnections[
      id
    ] = new RTCPeerConnection(this.rtcConfiguration));

    rtcPeerConnection.setRemoteDescription(offer).then(() => {
      rtcPeerConnection.createAnswer().then((sdp) => {
        rtcPeerConnection.setLocalDescription(sdp).then(() => {
          this.broadcastService.emit(
            "answer",
            id,
            streamType,
            rtcPeerConnection.localDescription,
          );
        });
      });
    });

    rtcPeerConnection.onicecandidate = this.handleIceCandidate.bind(
      this,
      id,
      streamType,
    );

    rtcPeerConnection.ontrack = (event) => {
      this.emit("newViewer", {
        id,
        streamType,
        stream: event.streams[0],
      });
    };
  }

  private registerStreamListeners(streamType: StreamTypes): void {
    this.broadcastService.listen("answer", this.answer.bind(this));
    this.broadcastService.listen("watcher", this.watcher.bind(this));
    this.broadcastService.listen("candidate", this.candidate.bind(this));
    if (streamType === StreamTypes.Broadcasting) {
      this.broadcastService.listen("offer", this.offer.bind(this));
    }
  }

  private watcher({ id, streamType }: Viewer): void {
    let rtcPeerConnection = (this.localRtcPeerConnections[streamType][
      id
    ] = new RTCPeerConnection(this.rtcConfiguration));

    this.localStream.getTracks().forEach((track) => {
      rtcPeerConnection.addTrack(track, this.localStream);
    });

    rtcPeerConnection.onnegotiationneeded = () => {
      rtcPeerConnection
        .createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        })
        .then((sdp) => {
          rtcPeerConnection.setLocalDescription(sdp).then(() => {
            this.broadcastService.emit(
              "offer",
              id,
              streamType,
              rtcPeerConnection.localDescription,
            );
          });
        });
    };

    rtcPeerConnection.onicecandidate = this.handleIceCandidate.bind(
      this,
      id,
      streamType,
    );
  }
}
