import { DesktopCapturerSource } from "electron";

export type DesktopSources = {
  windows: Array<DesktopCapturerSource>;
  screens: Array<DesktopCapturerSource>;
};
