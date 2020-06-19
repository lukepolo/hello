import { StreamTypes } from "@app/constants/StreamTypes";

export type RtcPeerConnections = {
  [StreamTypes.Presenting]: { [key: string]: RTCPeerConnection };
  [StreamTypes.Broadcasting]: { [key: string]: RTCPeerConnection };
};
