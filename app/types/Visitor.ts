import { StreamTypes } from "@app/constants/StreamTypes";

export type Visitor = {
  id: string;
  stream: MediaStream;
  streamType: StreamTypes;
};
