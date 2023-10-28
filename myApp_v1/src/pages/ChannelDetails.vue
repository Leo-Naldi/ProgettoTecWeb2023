<template>
  <q-page>
    <div class="top-img">
      <!-- <q-avatar rounded size="11rem" color="blue-6" text-color="white"  @click.stop.prevent="clickMe(author)"> -->
      <!-- <img src="https://images.unsplash.com/photo-1682685797795-5640f369a70a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxlZGl0b3JpYWwtZmVlZHwxfHx8ZW58MHx8fHx8&auto=format&fit=crop&w=900&q=60" /> -->
      <!-- {{ paramId[0] }} -->
      <!-- </q-avatar> -->
      <!-- </q-avatar> -->

    </div>
    <p class="text-weight-bold text-h4">
      {{ $route.params.channelName }}
    </p>
    <div class="display: flex; align-items: center; justify-content: center">

      <p class="">Description: {{ channelDetails.description }}</p>
      <p class="">creator: @{{ channelDetails.creator }} </p>

    </div>
    <div class="center-container">
      <channel-button channel_name="$route.params.channelName" style="box-sizing: content-box; font-size:15px" />
    </div>
    <p>editors: {{ channelDetails.editors }}</p>

    <div clickable class="cursor-pointer" style="display:flex; align-items:center; justify-content:space-between; ">
      <div class="q-pa-md q-gutter-sm" style="height: 80px">
        <q-avatar v-for="n in channelDetails.members_name.length" :key="n" size="40px" class="overlapping" :style="`left: ${n * 25}px`">
          <img :src="`https://cdn.quasar.dev/img/avatar${n + 1}.jpg`">
        </q-avatar>
        <div style="margin-left: 12rem; margin-top: 1rem;">
          <a>{{ channelDetails.members_name.length }}</a
            >&nbsp; members</div>
            <q-popup-proxy>
              <div class="flex flex-center" style="width: 400px;position:absolute;">
                <!-- <UserEnum :users="channelDetails.members"></UserEnum> -->
<ShowDialog :component="`<UserEnum :users='channelDetails.members'/>`" :users="channelDetails.members"></ShowDialog>
              </div>
              </q-popup-proxy>
      </div>
    <div style="order:2">
      <q-btn flat icon="settings"
          @click="showFilter()" class="cursor-pointer" />
    </div>
    </div>
    <!--  <div >
    <p><a class="display: flex">{{ channelDetails.members }}</a>&nbsp; members&nbsp; &nbsp;  <q-icon name="settings" @click="showFilter()" class="cursor-pointer" /></p>
  </div> -->


    <!-- <q-scroll-area class="absolute full-width full-height"> -->
    <!--

    if the channel creator, display "Edit", click to jump to the page of editing the channel;
    If not a channel member, display "follow", click to become a member of this channel;
    If you are a channel member, display "unfollow", click to exit from the current channel's membership
   -->

    <q-separator class="divider" color="grey-2" size="10px" />

    <q-list separator>
      <ShowPost v-for="post in channelDetails.messages" :key="post.id" v-bind="post" clickable />

    </q-list>
    <p v-if="channelDetails.messages.length <= 0">没有相关回复</p>
    <!-- </q-scroll-area> -->
  </q-page>
</template>


<script setup>
import ChannelButton from 'src/components/ChannelButton.vue';
import { useChannelStore } from 'src/stores/channels.js';
import { useUserStore } from 'src/stores/user';
import UserEnum from 'src/components/UserEnum.vue';
import { usePostStore } from 'src/stores/posts';
import { ref, onMounted, reactive } from "vue";
import ShowPost from "src/components/posts/ShowPost.vue";
import ShowDialog from "src/components/ShowDialog.vue";
import { useRouter } from "vue-router";


const channelStore = useChannelStore()
const postStore = usePostStore()
const userStore = useUserStore()
const router = useRouter();


/*
  {
    "_id": "653aa3156fbf53734f38674e",
    "name": "daily_news",
    "description": "i'm going to take a short digest of the world news everyday",
    "creator": "fv",
    "publicChannel": true,
    "official": false,
    "created": "2023-10-26T17:34:13.530Z",
    "members": [],
    "editors": [],
    "memberRequests": [],
    "editorRequests": [],
    "id": "653aa3156fbf53734f38674e"
  }
*/
const channelDetails = reactive({
  description: NaN,
  creator: NaN,
  members_name:[],
  members:[],
  editors:[],
  member_requests:[],
  editor_requests:[],
  messages: [],
})

const fetchChannelData = async (channelId) => {
  const data = await channelStore.searchChannel(channelId)
  console.log("data:",data)
  if(data.length>0){
  channelDetails.description = data[0].description
  channelDetails.creator = data[0].creator
  channelDetails.members_name = data[0].members

  channelDetails.editors = data[0].editors
  channelDetails.member_requests = data[0].member_requests
  channelDetails.editor_requests = data[0].editor_requests
  // const data2= await fetchMembers(data[0].members)
  const data2 = await userStore.getUserArr(data[0].members)

  channelDetails.members=data2
  }
}

const fetchChannelMessages = async (channelId) => {
  const data = await postStore.fetchChannelPost(channelId)
  channelDetails.messages = data
}

const fetchMembers = async (arr_members) => {
  const data = await userStore.getUserArr(arr_members)
  // channelDetails.members = data
}

const showFilter=()=>{
  console.log("channel settings")
}

onMounted(() => {
  const paramId = router.currentRoute.value.params.channelName;
  if (typeof paramId !== 'undefined') {
    console.log("now you're searching informations for channel: ", paramId)
    fetchChannelData(paramId)
    fetchChannelMessages(paramId)
  }
})

</script>



<style scoped lang="sass">

.my-channel
  display: flex
  align-items: center
  justify-content: center
  margin-top: 2rem
  margin-bottom: 2rem
p
  display: flex
  align-items: center
  justify-content: center

.channel-button
  border-radius: 1rem


.top-img
  height: 320px
  width: 100%
  margin-bottom: 1rem
  background-size: cover
  background-position: center center
  background-image: url(https://images.unsplash.com/photo-1696219852009-3d231b68538a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw0fHx8ZW58MHx8fHx8&auto=format&fit=crop&w=900&q=60)

.center-container
  display: flex
  justify-content: center
  margin-bottom: 2rem

.overlapping
  border: 2px solid white
  position: absolute
</style>
