<template>
  <router-view />
  <NotifyType ref="audio"></NotifyType>
</template>

<script>
import { defineComponent,ref,onMounted,onUnmounted } from 'vue'
import { usePostStore } from "src/stores/posts.js";
import { useChannelStore } from "src/stores/channels.js";
import { useAuthStore } from './stores/auth';
import NotifyType from "src/components/notify/NotifyType.vue";
import { LocalStorage } from 'Quasar'
import { useSocketStore } from "src/stores/socket";
import { useNotificationsStore } from 'src/stores/notifications';
import { useRouter } from "vue-router";
import { useGlobalStore } from "src/stores/global";

export default defineComponent({
  name: 'App',
  data() {
    return {
      postStore: usePostStore(),
      authStore: useAuthStore(),
      channelStore: useChannelStore(),
    };
  },
  components: {
    NotifyType
  },
  created() {
    this.postStore.fetchPosts()
      this.channelStore.fetchAutoCompleteChannels()
      this.channelStore.fetchAllChannelName()
/*     if (LocalStorage.getItem('user')) {
      this.postStore.fetchPosts()
      this.channelStore.fetchAutoCompleteChannels()
      this.channelStore.fetchAllChannelName()
    } */
  },
  setup(){
    const globalStore = useGlobalStore()
    const audio = ref()
    const notificationStore = useNotificationsStore()
    const authStore = useAuthStore()
    const socketStore = useSocketStore()
    const postStore = usePostStore()
    const mytoken = authStore.getToken()
    const myhandle = authStore.getUserHandle()
    socketStore.setSocket(myhandle, mytoken);
    const mysocket = socketStore.getSocket;
    const  userPost= ref([])
    let timerId =null

    const fetchUserData = async () => {
      userPost.value = await postStore.fetchUserPosts(myhandle);
    };

    onMounted(() => {
      fetchUserData();
      /*
        notify with socket, if not clicked then the notifications will save to store
        3 type of notify:
          - message send to me ("dest" include my "handle")
          - reply to my post ("answering" include my post's id)
          - reaction to my post
      */
      mysocket.on("message:created", (message) => {
        if (message.answering && userPost.value.some(obj => obj._id === message.answering) && message.dest && message.dest.includes("@"+myhandle)){
          notificationStore.set_c_unread(message)
          var new_MsgRe_sound ="/src/assets/newMsgRe.mp3"
          audio.value.show_notifications_ReMsg(new_MsgRe_sound, message.answering, message.id);
        }
        else if (message.answering && userPost.value.some(obj => obj._id === message.answering)) {     // if has replies to my messages
          notificationStore.set_c_unread(message)
          var new_reply_sound ="/src/assets/newReply.mp3"
          audio.value.show_notifications_reply(new_reply_sound, message.answering)
        }
        else if( message.dest && message.dest.includes("@"+myhandle)){                       // if has message send to me
          notificationStore.set_m_unread(message)
          var new_message_sound ="/src/assets/newMessage.mp3"
          audio.value.show_notifications_message(new_message_sound, message.id);
        }
        globalStore.incrementUnread()
      });

      mysocket.on("reaction:recived", (message) => {
        const foundObj = userPost.value.find(obj => obj.id === message.id);
        if (foundObj!=undefined) {
          notificationStore.set_r_unread(foundObj)
        }
        globalStore.incrementUnread()
      });

      /* every 30s check if there're unread messages, if clicked, jump to notification page */
      timerId = setInterval(() => {
        let sum = notificationStore.getUnread

        if (sum!= 0) {
          const notify_sound ="/src/assets/Notify.mp3"
          audio.value.show_notifications(notify_sound);
        }
      }, 30000); /* 1000 = 1s */
    }),
    onUnmounted(() => {
      clearInterval(timerId);
    });

    return {
      userPost,
      audio,
      globalStore,
    };
  }
})


</script>
