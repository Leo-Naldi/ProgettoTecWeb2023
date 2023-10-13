import { defineStore } from "pinia";
import io from "socket.io-client";

export const useSocketStore = defineStore("socket", {
  state: () => ({
    socket: "",
  }),

  getters: {
    getSocket(state) {
      return state.socket;
    },
  },

  actions: {
    setSocket(handle, token) {
      if (handle && token) {
        this.socket = io("http://localhost:8000/user-io/" + handle, {
          extraHeaders: {
            Authorization: "Bearer " + token,
          },
        });
      } else {
        this.socket = null;
      }
    },
  },
});
