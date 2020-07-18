import { RoomState } from "./stateInterface";

export default function() {
  return {
    SAMPLE_GETTER: (state: RoomState) => {
      return state;
    },
  };
}
