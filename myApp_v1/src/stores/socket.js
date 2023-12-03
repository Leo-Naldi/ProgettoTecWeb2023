import { defineStore } from "pinia";
import io from "socket.io-client";
import { useNotificationsStore } from "./notifications";
import { useGlobalStore } from "./global";
import { useAuthStore } from "./auth";
import { usePostStore } from "./posts";
import { useUserStore } from "./user";
import { computed } from "vue";

export const useSocketStore = defineStore("socket", {
  state: () => ({
    socket: null,
  }),

  getters: {
    getSocket: (state) => state.socket,
  },

  actions: {
    setSocket(handle, token) {
      if (handle && token) {
        this.socket = io("http://localhost:8000/user-io/" + handle, {
          extraHeaders: {
            Authorization: "Bearer " + token,
          },
          forceNew: true,
        });
      }
    },
    setSocket2() {
      const handle = useAuthStore().getUserHandle();
      const token = useAuthStore().getToken();
      if (handle && token) {
        this.socket = io("http://localhost:8000/user-io/" + handle, {
          extraHeaders: {
            Authorization: "Bearer " + token,
          },
        });
      }
    },
    setPublicSocket() {
      this.socket = io("http://localhost:8000/public-io/", {
        forceNew: true,
      });
    },
    resetSocket() {
      if (this.socket != null) {
        this.socket.disconnect();
        this.socket = null;
      }
    },
    startNoLoginSocket() {
      this.resetSocket();
      this.setPublicSocket();
      const mysocket = this.getSocket;
      console.log("start nologin socket!", mysocket);

      mysocket.on("message:created", (message) => {
        if (useGlobalStore().getHasClickedShowMore === true) {
          useNotificationsStore().reset_public_unread();
          console.log("public socket get message: ", message);
          // useGlobalStore().resetClickShowMore()
          useGlobalStore().resetHasClickedShowMore();
        }
        useNotificationsStore().set_public_unread(
          usePostStore().messageHandler([message])
        );
        // console.log(message)
      });
    },
    startLoggedInSocket() {
      this.resetSocket();
      const globalStore = useGlobalStore();
      const postStore = usePostStore();
      const notificationStore = useNotificationsStore();
      const userStore = useUserStore()
      const authStore = useAuthStore()

      const userPost = postStore.userPosts;
      console.log("userPost: ", userPost)

      this.setSocket2();
      const mysocket = this.getSocket;
      const myhandle = useAuthStore().getUserHandle();
      console.log("start login socket!", mysocket);

      /*
        notify with socket, if not clicked then the notifications will save to store
        3 type of notify:
          - message send to me ("dest" include my "handle")
          - reply to my post ("answering" include my post's id)
          - reaction to my post
      */
      mysocket.on("message:created", (message) => {
        // console.log("TODO: No print??", message.answering)
        // console.log("TODO: No print??",userPost.some((obj) => obj._id === message.answering))

        if (message.length > 0) {
          console.log(
            "start to listen socket ！",
            message,
            message.dest.includes("@" + myhandle)
          );
        }

        if (
          message.answering &&
          userPost.some((obj) => obj._id === message.answering) &&
          message.dest &&
          message.dest.includes("@" + myhandle)
        ) {
          notificationStore.set_m_unread(message);
          notificationStore.set_playNewRe(message.id, message.answering);
        } else if (message.dest && message.dest.includes("@" + myhandle)) {
        /*             else if (
              message.answering &&
              userPost.some((obj) => obj._id === message.answering)
            ) {     // TODO: if has replies to my messages
              notificationStore.set_c_unread(message);
              notificationStore.set_playRe(message);
            }  */
          // if has message send to me
          notificationStore.set_m_unread(message);
          notificationStore.set_playNew(message.id);
        }
        globalStore.incrementUnread();
      });

      mysocket.on("reaction:recived", (message) => {
        const foundObj = userPost.find((obj) => obj.id === message.id);
        if (foundObj != undefined) {
          notificationStore.set_r_unread(foundObj);
          notificationStore.set_playReac(message.id);
        }
        globalStore.incrementUnread();
      });

      mysocket.on("user:changed", (message)=>{

        console.log("user changed: ", message)
        userStore.modifyUser(message)
        authStore.setUser(message)
      })
    },
  },
});
