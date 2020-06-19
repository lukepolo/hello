declare module "*.vue" {
  import Vue from "vue";
  import ChatService from "@app/services/ChatService";
  import DeviceService from "@app/services/DeviceService";
  import StreamController from "@app/streams/StreamController";
  import BroadcastService from "@app/services/BroadcastService";
  import DummyCaptureService from "@app/services/DummyCaptureService";
  import CameraCaptureService from "@app/services/CameraCaptureService";
  import RemoteControlService from "@app/services/RemoteControlService";
  import RoomStreamingService from "@app/services/RoomStreamingService";
  import DesktopCaptureService from "@app/services/DesktopCaptureService";
  import OperationSystemService from "@app/services/OperationSystemService";
  import MicrophoneCaptureService from "@app/services/MicrophoneCaptureService";

  const broadcastService: BroadcastService;

  // CHAT SERVICES
  const chatService: ChatService;

  // OS SERVICES
  const deviceService: DeviceService;
  const operationSystemService: OperationSystemService;

  // STREAMING SERVICES
  const streamController: StreamController;
  const remoteControlService: RemoteControlService;
  const roomStreamingService: RoomStreamingService;

  // CAPTURE SERVICES
  const dummyCaptureService: DummyCaptureService;
  const cameraCaptureService: CameraCaptureService;
  const desktopCaptureService: DesktopCaptureService;
  const microphoneCaptureService: MicrophoneCaptureService;

  export default Vue;
}
