import { injectable } from "inversify";
import { Devices } from "@app/types/Devices";
import { DeviceTypes } from "@app/constants/DeviceTypes";

@injectable()
export default class DeviceService {
  public getDevices(
    type?: DeviceTypes,
  ): Promise<Array<MediaDeviceInfo> | Devices> {
    return navigator.mediaDevices.enumerateDevices().then((mediaDevices) => {
      let devices = {
        [DeviceTypes.Camera]: [],
        [DeviceTypes.Speaker]: [],
        [DeviceTypes.Microphone]: [],
      };
      mediaDevices.forEach((device) => {
        if (devices[device.kind]) {
          devices[device.kind].push(device);
        }
      });
      return type ? devices[type] : devices;
    });
  }
}
