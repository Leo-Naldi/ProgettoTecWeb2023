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
      console.log("start to fetchLogin data!")
      // await this.fetchChannels()
      await useUserStore().handleUserJson(getUser())
      // console.log("liked: ", getUser().liked)
      // await this.fetchPosts( {liked: this.isLoggedin.liked, disliked: this.isLoggedin.disliked})

      await useUserStore().fetchAllUserName()
      await useUserStore().fetchAutoCompleteUsers()

      await useChannelStore().fetchAllChannelName()
      await useChannelStore().fetchAutoCompleteChannels()

      await usePostStore().fetchLoggedUserPosts()

    },
    async fetchPublic(){
      console.log("start to fetchPublic data!")
      await useChannelStore().fetchOfficialChannels()
      // for (var tweet of usePostStore().getOfficialPosts) {
      //   usePostStore().updateHashTag(tweet);  // get hashtagTrends and trendList
      // }
    },
  },
  watch:{
    isLoggedin(newV){
      if(newV==true){
        console.log("【App.vue】login action is detected!")
        this.fetchLogin()
        this.startLoggedInSocket()
      }
      else{
        console.log("【App.vue】logout action is detected")
        this.fetchPublic()
        this.startNoLoginSocket()
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
      useUserStore().userLocalToStore()
      await this.fetchLogin()
      this.startLoggedInSocket()
    }
  },
})
</script>
