import { DeviceTypes } from "@app/constants/DeviceTypes";

export type Devices = {
  [DeviceTypes.Camera]: Array<MediaDeviceInfo>;
  [DeviceTypes.Speaker]: Array<MediaDeviceInfo>;
  [DeviceTypes.Microphone]: Array<MediaDeviceInfo>;
};
