import { defineStore } from "pinia";
import io from "socket.io-client";
import { baseURL } from "src/common/myGlobals";
import { useGlobalStore } from "./global";
import { usePostStore } from "./post";
import { useNotificationsStore } from "./notification";
import { useUserStore } from "./user";
import {useAccountStore} from "./account"
import { format } from "date-fns";



import { LocalStorage } from "quasar";
import { USER_KEY, TOKEN_KEY, setUser } from "src/common/localStorageHandler";


export const useSocketStore = defineStore("socket", {
  state: () => ({
    socket: null,
  }),

  getters: {
    getSocket: (state) => state.socket,
  },

  actions: {
    setSocket() {
      const handle = useUserStore().getUserHandle
      const token = useUserStore().getUserToken
      if (handle && token) {
        this.socket = io(baseURL+"/user-io/" + handle, {
          extraHeaders: {
            Authorization: "Bearer " + token,
          },
        });
      }
    },
    setPublicSocket() {
      this.socket = io(baseURL+"/public-io/", {
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
      console.log("start no Login socket!")
      this.resetSocket();
      this.setPublicSocket();
      const mysocket = this.getSocket;
      // console.log("start public socket!", mysocket);
      const {getHasClickedShowMore, resetHasClickedShowMore} = useGlobalStore()
      const {set_public_unread, reset_public_unread} = useNotificationsStore()
      const {messageHandler, updatePublicPosts, setSocketPost} = usePostStore()

      mysocket.on("message:created", (message) => {
        console.log("you get a message in public socket! ", message)
        if (getHasClickedShowMore === true) {
          resetHasClickedShowMore();
        }
        updatePublicPosts(message)
        reset_public_unread();
        const res = messageHandler([message])
        set_public_unread(res);
        setSocketPost(res)
        // console.log(message)
      });
    },
    startLoggedInSocket() {
      console.log("start Logged socket!")
      this.resetSocket();
      const globalStore = useGlobalStore();
      const postStore = usePostStore();
      const notificationStore = useNotificationsStore();
      const userStore = useUserStore()

      const userPost = postStore.getUserPosts;
      // console.log("userPost: ", userPost)

      this.setSocket();
      const mysocket = this.getSocket;
      const myhandle = useUserStore().getUserHandle;
      // console.log("start login socket!", mysocket);

      /*
        notify with socket, if not clicked then the notifications will save to store
        3 type of notify:
          - message send to me ("dest" include my "handle")
          - reply to my post ("answering" include my post's id)
          - reaction to my post
      */
      mysocket.on("message:created", (message) => {
        console.log("[socket, message:created] you have a new message! ", message)
        const res = postStore.updatePosts(message)
        postStore.setSocketPost(res)
        // console.log("message changed: ", message)
/*         if (message.length > 0) {
          console.log(
            "【socket.js】start to listen socket ！ and the message is, include @?",
            message,
            message.dest.includes("@" + myhandle)
          );
        }
        */

/*      ok, reply to me and send to me
         if (
          message.answering &&
          userPost.find((obj) => obj._id === message.answering) &&
          message.dest &&
          message.dest.includes("@" + myhandle)
        ) {
          notificationStore.set_m_unread(message);
          notificationStore.set_playNewRe(message.id, message.answering);
        }
        else  */

        // if received replies to my posts
        if ( message.answering && userPost.find((obj) => obj._id === message.answering) ) {
          notificationStore.set_c_unread(message);
          notificationStore.set_playRe(message);
          globalStore.incrementUnread();
        }
        // if received posts with dest is me
        else if (message.dest && message.dest.includes("@" + myhandle)) {
          notificationStore.set_m_unread(message);
          notificationStore.set_playNew(message.id);
          globalStore.incrementUnread();
        }
      });

      // if received reactions
      mysocket.on("message:changed", (message) => {
        const foundObj = userPost.find((obj) => obj.id === message.id);
        if (foundObj) {
          // console.log("[socket] 出错！", userPost, message )
          // you get an unread reaction message
          notificationStore.set_r_unread(foundObj);
          notificationStore.set_playReac(message.id);
          globalStore.incrementUnread();
        }
      });

      mysocket.on("user:changed", (user)=>{
        console.log("[socket] 's user changed: ", user)
/*
        userStore.modifyUser(message)
        setUser(message) */
        // 保留几个自定义的字段，剩下的都更改为 Socket 返回的 json
        const currentUserJson = useUserStore().getUserJson
        var newUser = user
        newUser["joinedChannels"] = currentUserJson.joinedChannels
        newUser["editorChannels"] = currentUserJson.editorChannels
        newUser["createdChannels"] = currentUserJson.createdChannels
        newUser["joinChannelRequests"] = currentUserJson.joinChannelRequests
        newUser["editorChannelRequests"] = currentUserJson.editorChannelRequests
        newUser["likedJson"] = currentUserJson.likedJson
        newUser["dislikedJson"] = currentUserJson.dislikedJson
        newUser["meta"].created = format(
            new Date(newUser.meta.created),
            "MMMM yyyy"
          );
        useUserStore().setUserJson(newUser)
        console.log("[socket] new user json is: ", newUser)
      })
    },
  },
});
