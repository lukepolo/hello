import os from "os";
import { injectable } from "inversify";

export enum PLATFORMS {
  WINDOWS = "WINDOWS",
  MAC = "MAC",
  LINUX = "LINUX",
  SUN = "SUN",
  OPENBSD = "OPENBSD",
  ANDROID = "ANDROID",
  AIX = "AIX",
}

enum PLATFORM_NAMES {
  win32 = PLATFORMS.WINDOWS,
  darwin = PLATFORMS.MAC,
  linux = PLATFORMS.LINUX,
  sunos = PLATFORMS.SUN,
  openbsd = PLATFORMS.OPENBSD,
  android = PLATFORMS.ANDROID,
  aix = PLATFORMS.AIX,
}

@injectable()
export default class OperationSystemService {
  public getOS(): PLATFORM_NAMES {
    return PLATFORM_NAMES[os.platform()];
  }
}
