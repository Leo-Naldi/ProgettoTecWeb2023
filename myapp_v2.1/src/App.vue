<template>
  <router-view />
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted, watch,computed,toRaw, } from 'vue'

import { getUser,
 } from "src/common/localStorageHandler";
// import { accountStore, postStore, channelStore, socketStore } from 'src/common/myStore';
import { useSocketStore } from "src/stores/socket";
import { usePostStore } from "src/stores/post";
import { useAccountStore } from "src/stores/account";
import { useChannelStore } from "src/stores/channel";
import { useUserStore } from './stores/user';


export default defineComponent({
  name: 'App',
  setup() {
    const { fetchPosts, fetchOfficialPosts, getOfficialPosts} = usePostStore();
    const {fetchOfficialChannels, getOfficialChannlLists, fetchChannels,  fetchAutoCompleteChannels} = useChannelStore()
    const {getSocket, startNoLoginSocket, startLoggedInSocket} = useSocketStore()
    const {handleUserJson, fetchAllUserName, fetchAutoCompleteUsers} = useUserStore()

    return {
      fetchOfficialPosts,
      fetchPosts,
      fetchOfficialChannels,
      fetchChannels,
      getOfficialChannlLists,
      getOfficialPosts,
      handleUserJson,
      startNoLoginSocket,
      startLoggedInSocket,
      getSocket,
      fetchAllUserName,
      fetchAutoCompleteUsers,
      fetchAutoCompleteChannels
    };
  },
  methods:{
    async fetchLogin() {
      console.log("[App.vue] 的 fetchLogin!")
      //TODO:继承反应计数
      // await this.fetchChannels()
      await useUserStore().handleUserJson(getUser())
      // console.log("liked: ", getUser().liked)
      // await this.fetchPosts( {liked: this.isLoggedin.liked, disliked: this.isLoggedin.disliked})

      await useUserStore().fetchAllUserName()
      await useUserStore().fetchAutoCompleteUsers()

      await useChannelStore().fetchAllChannelName()
      await useChannelStore().fetchAutoCompleteChannels()

      await usePostStore().fetchLoggedUserPosts()   // 用来确认是否有给自己的消息

    },
    async fetchPublic(){
      console.log("[App.vue] 的 fetchPublic!!!!")
      // await this.fetchOfficialPosts()
      await useChannelStore().fetchOfficialChannels()
      // for (var tweet of usePostStore().getOfficialPosts) {
      //   usePostStore().updateHashTag(tweet);  // 获得 hashtagTrends 以及 trendList
      // }
    },
  },
  watch:{
    isLoggedin(newV){
      // console.log("【App.vue】应该监听是否登录 如果登录了就开始抓取登录后的数据", newV)
      if(newV==true){
        console.log("【App.vue】监听到了登录")
        this.fetchLogin()
        this.startLoggedInSocket()
      }
      else{
        console.log("【App.vue】监听到了登出")
        this.fetchPublic()
        // this.startNoLoginSocket()
      }
    },
  },
  computed:{
    isLoggedin(){
      return getUser()!=null
    }
  },
  async mounted(){
    if (!this.isLoggedin && this.getSocket==null) {
      this.fetchPublic()
      this.startNoLoginSocket()
    }
    else if(this.isLoggedin && this.getSocket==null){
      // 把 local 里的 userJson 同步到 store 里
      useUserStore().userLocalToStore()
      await this.fetchLogin()
      this.startLoggedInSocket()
    }
  },
})
</script>
