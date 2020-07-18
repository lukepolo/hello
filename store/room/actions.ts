import { ActionContext } from "vuex";
import RootState from "@store/rootState";
import { RoomState } from "./stateInterface";

export default function(httpService) {
  return {
    get: async (
      context: ActionContext<RoomState, RootState>,
      { roomCode, password },
    ) => {
      return await httpService.post(`/rooms/${roomCode}`, {
        password,
      });
    },
    create: async (context: ActionContext<RoomState, RootState>, data) => {
      return await httpService.post("/rooms", data);
    },
  };
}
