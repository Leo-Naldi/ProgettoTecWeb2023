<template>
  <router-view />
  <NotifyType ref="audio"></NotifyType>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted, watch,computed } from 'vue'
import { usePostStore } from "src/stores/posts.js";
import { useChannelStore } from "src/stores/channels.js";
import { useAuthStore } from './stores/auth';
import { useGlobalStore } from "src/stores/global";
import { useUserStore } from './stores/user';
import { useSocketStore } from "src/stores/socket";
import { useNotificationsStore } from 'src/stores/notifications';

// import { channelStore, authStore, userStore, globalStore, hashStore, mapStore, notificationStore, postStore, socketStore } from './common/pinia_stores';



import NotifyType from "src/components/notify/NotifyType.vue";
import { LocalStorage } from 'Quasar'

import { useRouter } from "vue-router";


export default defineComponent({
  name: 'App',
  components: {
    NotifyType
  },
  data() {
    return {
      postStore: usePostStore(),
      authStore: useAuthStore(),
      userStore: useUserStore(),
      channelStore: useChannelStore(),
      // isLoggedin:useAuthStore().getLoggedState
      // notificationStore: useNotificationsStore()
    };
  },
  methods:{
    async  fetchUserPosts() {
    },
    async fetchOfficialPosts(paramId) {
      await this.postStore.fetchOfficialPosts()
    },
    async  fetchAllPosts() {
      await this.postStore.fetchPosts()
    },
    async fetchLogin() {
      // 登录之后就抓取：所有推文，用户的所有信息，用户的所有推文，填充store里的初始值，并开始 socket 监听
      // 从 localStorage 填充 store
      this.userStore.setUser(this.authStore.getUser(), this.authStore.getToken())
      //TODO: fetch userJoined Channel json poi lo sostituisco nel user json
      const joinedChannelsJson = await this.userStore.fetchUserJoinedChannels()
      const createdChannelsJson = await this.userStore.fetchUserCreatedChannels()
      // console.log("修改用户创建的频道之前：", createdChannelsJson)
      // console.log("修改用户加入的频道之前：", joinedChannelsJson)
      this.userStore.modifyUserField("joinedChannels", joinedChannelsJson)
      this.userStore.modifyUserField("createdChannels", createdChannelsJson)
      // console.log("修改用户加入的频道之后：", this.userStore.getUserJson)
      // console.log("修改用户创建的频道之后：", this.userStore.getUserJson.createdChannels)
      // console.log("检查userStore是否填充正确？", this.userStore.getUserJson) // get a proxy
      // console.log("检查userStore是否填充正确？", this.userStore.getUserToken) // get a string
      await this.channelStore.fetchChannels()
      // console.log("我获取了所有的频道，从store 获得：", this.channelStore.getChannelLists)
      await this.postStore.fetchUserPosts()
      await this.postStore.fetchPosts()
      this.socketStore.startLoggedInSocket()
    },

  },
  watch:{
    isLoggedin(newV){
      if(newV==true){
        // this.socketStore.setSocket2()
        this.postStore.fetchUserPosts()
        this.postStore.fetchPosts()
        const userPost = this.postStore.getUserPosts
        this.socketStore.startLoggedInSocket(userPost)
        // console.log("true: ",this.socketStore.getSocket)

        // if(this.postStore.getUserPosts==null){
        //   this.postStore.fetchUserPosts()
        // }
      }
      else{
        this.socketStore.startNoLoginSocket()
        // console.log("false: ",this.socketStore.getSocket)
      }
    },
  },
  computed:{
    isLoggedin(){
      return this.authStore.getLoggedState
    }
  },
  setup() {
    const globalStore = useGlobalStore()
    const audio = ref()
    const notificationStore = useNotificationsStore()
    const socketStore = useSocketStore()
    const postStore = usePostStore()
    const authStore = useAuthStore()

    const userPost = ref([])
    const timerId = ref(null)

    watch(
      () => notificationStore.getPlayNew.cnt,
      (oldV, newV) => {
        if (oldV != newV) {
          console.log("display notify!")
          var new_message_sound = "/src/assets/newMessage.mp3";
          audio.value.show_notifications_message(new_message_sound, notificationStore.getPlayNew.id);
        }
      },
      {
        deep: true,
      }
    )
/*     watch(
      () => notificationStore.getPlayRe.cnt,
      (oldV, newV) => {
        if (oldV != newV) {
          console.log("display notify!")

          var new_reply_sound = "/src/assets/newReply.mp3";
          audio.value.show_notifications_reply(
            new_reply_sound,
            notificationStore.getPlayNewRe.answering
          );
        }
      },
      {
        deep: true,
      }
    ) */
    watch(
      () => notificationStore.getPlayNewRe.cnt,
      (oldV, newV) => {
        if (oldV != newV) {
          console.log("display notify!")
          var new_MsgRe_sound = "/src/assets/newMsgRe.mp3";
              audio.value.show_notifications_ReMsg(
                new_MsgRe_sound,
                notificationStore.getPlayNewRe.answering,
                notificationStore.getPlayNewRe.id
              );
        }
      },
      {
        deep: true,
      }
    )

    watch(
      () => notificationStore.getPlayReac.cnt,
      (newV) => {
        if (newV ==true) {
          console.log("display notify!")
          var new_MsgRe_sound = "/src/assets/newMsgRe.mp3";
              audio.value.show_notifications_reaction(
                new_MsgRe_sound,
                notificationStore.getPlayReac.id
              );
        }
      },
      {
        deep: true,
      }
    )
    onMounted(()=>{
      const tmpTimer = setInterval(() => {
        let sum = notificationStore.getUnread;

        if (sum != 0) {
          notificationStore.set_playAll();
          var notify_sound = "/src/assets/Notify.mp3";
          audio.value.show_notifications(notify_sound);
        }
      }, 5000); /* 1000 = 1s */
      globalStore.setTimerId(tmpTimer);
    })

      onUnmounted(() => {
        if(globalStore.getTimerId!=null){
          clearInterval(globalStore.timerId)
          globalStore.resetTimerId()
        }
      });

    return {
      userPost,
      audio,
      socketStore,
      timerId
    };
  },
  mounted(){
    if (this.authStore.getLocalStorageData == null && this.socketStore.getSocket==null) {
      this.fetchOfficialPosts()
      this.socketStore.startNoLoginSocket()
    }
    else if(this.authStore.getLocalStorageData != null && this.socketStore.getSocket==null){
      this.fetchLogin()
      // const userPost = this.postStore.getUserPosts
      // this.socketStore.startLoggedInSocket(userPost)

      // console.log("there's localstorage -> socket ",socketStore)
    }
    /* every 30s check if there're unread messages, if clicked, jump to notification page */

  }
  /* watch(){
    ()=>this.authStore.getLoggedState,
    (newV, oldV)=>{
      console.log("new value is: ", newV)
      console.log("old value is: ", oldV)
    }
  } */
})


</script>
