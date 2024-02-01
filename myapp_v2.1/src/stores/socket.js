import { defineStore } from "pinia";
import io from "socket.io-client";
import { baseURL } from "src/common/myGlobals";
import { useGlobalStore } from "./global";
import { usePostStore } from "./post";
import { useNotificationsStore } from "./notification";
import { useUserStore } from "./user";
import { format } from "date-fns";
import { showNegative } from "src/common/utils";
import { computed } from "vue";


export const useSocketStore = defineStore("socket", {
  state: () => ({
    socket: null, // public and public-feed
    socketUser: null,
  }),

  getters: {
    getSocket: (state) => state.socket,
    getSocketUser: (state) => state.socketUser,
  },

  actions: {
    setPublicFeedSocket(){
      const token = useUserStore().getUserToken
      if (token){
        this.socket = io(baseURL+"/public-feed-io/", {
          extraHeaders: {
            Authorization: "Bearer " + token,
          },
          forceNew: true,
        });
      }
      else{
        showNegative("start socket failed because of invalid user token!")
      }
    },
    setSocket() {
      const handle = useUserStore().getUserHandle
      const token = useUserStore().getUserToken
      if (handle && token) {
        this.socketUser = io(baseURL+"/user-io/" + handle, {
          extraHeaders: {
            Authorization: "Bearer " + token,
          },
          forceNew: true,
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
      if (this.socketUser != null) {
        this.socketUser.disconnect();
        this.socketUser = null;
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
      mysocket.on("message:deleted", (message) => {
        console.log("【public socket】 a message is deleted!", message)
      });
      mysocket.on("message:changed", (message) => {
        console.log("【public socket】 a message is changed!", message)
      });
      mysocket.on("channel:deleted", (channel) => {
        console.log("【public socket】 a channel is deleted!", channel)
      });
      mysocket.on("channel:changed", (channel) => {
        console.log("【public socket】 a channel is changed!", channel)
      });
    },
    startLoggedInSocket() {
      console.log("start Logged socket!")
      this.resetSocket();
      const globalStore = useGlobalStore();
      const postStore = usePostStore();
      const notificationStore = useNotificationsStore();
      const userPost = computed(()=>usePostStore().getUserPosts);  // debug:
      // console.log("userPost: ", userPost)

      this.setSocket();
      const mysocket = this.getSocketUser;
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
        const res = usePostStore().updatePosts(message)
        usePostStore().setSocketPost(res)
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
        if ( message.answering && userPost.value.find((obj) => obj._id === message.answering) ) {
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
        const foundObj = userPost.value.find((obj) => obj.id === message.id);
        if (foundObj) {
          // you get an unread reaction message
          notificationStore.set_r_unread(foundObj);
          notificationStore.set_playReac(message.id);
          globalStore.incrementUnread();
        }
      });

      mysocket.on("message:deleted", (message) => {
        console.log("【logged socket】 a message is deleted!", message)
      });

      mysocket.on("user:changed", (user)=>{
        console.log("[socket] 's user changed: ", user)
/*
        userStore.modifyUser(message)
        setUser(message) */
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

      mysocket.on("channel:changed", (channel) => {
        console.log("【logged socket】 a channel has been changed!", channel)
      });

      mysocket.on("channel:deleted", (channel) => {
        console.log("【logged socket】 a message is deleted!", channel)
      });

      mysocket.on('disconnect', () => {
        showNegative("【current user socket disconnected! 】")
      })
      mysocket.on('error', (error) => {
        showNegative('Socket error! Please open console to see details');
        console.log("【namespace socket error】: ", error)
      });

      this.setPublicFeedSocket()
      const publicFeedSocket = this.getSocket;
      publicFeedSocket.on("message:created", (message)=>{
        usePostStore().setSocketPostPublic(message)
        console.log("【public feed socket】a new messages shows up!", message)
      })
      publicFeedSocket.on("message:deleted", (message) => {
        console.log("【public feed socket】 a message is deleted!", message)
      });
      publicFeedSocket.on("message:changed", (message) => {
        console.log("【public feed socket】 a message is changed!", message)
      });

      publicFeedSocket.on("channel:deleted", (channel) => {
        console.log("【public feed socket】 a channel is deleted!", channel)
      });
      publicFeedSocket.on("channel:changed", (channel) => {
        console.log("【public feed socket】 a channel is changed!", channel)
      });

      publicFeedSocket.on("user:deleted", (user) => {
        console.log("【public feed socket】 a user is deleted!", user)
      });
      publicFeedSocket.on("user:changed", (user) => {
        console.log("【public feed socket】 a user is changed!", user)
      });

      publicFeedSocket.on('disconnect', () => {
        showNegative("【public feed socket disconnected! 】")
      })
      publicFeedSocket.on('error', (error) => {
        showNegative('Public feed error! Please open console to see details');
        console.log("【public feed socket error】: ", error)
      });
    },
  },
});
