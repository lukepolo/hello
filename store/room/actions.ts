import { ActionContext } from "vuex";
import RootState from "@store/rootState";
import { RoomState } from "./stateInterface";

export default function(httpService) {
  return {
    startMeeting: (context: ActionContext<RoomState, RootState>, data) => {
      return httpService.post("/rooms", data);
    },
  };
}
