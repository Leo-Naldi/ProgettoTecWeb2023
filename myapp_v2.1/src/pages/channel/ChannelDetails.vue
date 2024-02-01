<template>
  <q-page role="main" aria-labelledby="channelTitle">
    <div class="top-img">
    </div>
    <p class="text-weight-bold text-h4" id="channelTitle">
      {{ $route.params.channelName }}
    </p>
    <div class="text-center" roly="region" aria-label="Channel Details Information">

      <p>Description: {{ channelDetails.description }}</p>
      <p>creator: <router-link :to="'/user/details/'+channelDetails.creator">@{{ channelDetails.creator }}</router-link> </p>
      <div class="text-secondary q-pb-md">Now you can see all channel posts <router-link :to="{ name: 'ChannelMap', params: { channels: $route.params.channelName }}">here</router-link>
 on the map!</div>


    </div>
    <div class="center-container" role="region" aria-label="Channel Member actions">
      <ChannelButton role="button" tabindex="0" :channel=channelDetails :channel_name=$route.params.channelName style="box-sizing: content-box; font-size:15px" />
    </div>
    <!-- <p>member_requests: {{ channelDetails.member_requests }}</p> -->
    <!-- <p>editors_requests: {{ channelDetails.editor_requests }}</p> -->

    <div clickable class="cursor-pointer flex items-center justify-between" >
      <div class="q-pa-md q-gutter-sm" style="height: 80px;">
        <q-avatar v-for="n in channelDetails.members_name.length" :key="n" size="40px" class="overlapping"
          :style="`left: ${n * 25}px`">
          <img :alt="`the ${n}th channel member avatar`" :src="`https://cdn.quasar.dev/img/avatar${(n + 1)%5+1}.jpg`">
        </q-avatar>

        <div :style="`position:absolute; left: ${(channelDetails.members_name.length+2)*25}px; margin-top: 1rem;`">
          <a>{{ channelDetails.members_name.length }}</a>&nbsp; members
        </div>

        <q-popup-proxy>
          <CloseDialog >
              <ChannelUserDetails />
          </CloseDialog>
        </q-popup-proxy>

      </div>

      <div style="order:2" v-if="channelDetails.isCreator">
        <q-btn flat round icon="settings"  class="cursor-pointer" >
          <q-popup-proxy>
          <CloseDialog>
              <ChannelSettings />
          </CloseDialog>
        </q-popup-proxy>

        </q-btn>
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
   <q-separator class="divider" color="grey-2" size="10px" v-if="channelDetails.isEditor" />
   <WritePost :destChannel=$route.params.channelName v-if="channelDetails.isEditor"/>

    <q-separator class="divider" color="grey-2" size="10px" />

    <q-list separator v-if="channelDetails.isMember || channelDetails.isOfficial" role="list" aria-label="Channel Messages">
      <ShowPost v-for="post in channelDetails.messages" :key="post.id" v-bind="post" clickable />

    </q-list>
    <p v-if="!channelDetails.isMember && !channelDetails.isOfficial && channelDetails.messages.length <= 0" role="status" aria-live="assertive">You're not a member, you cannot see the messages!</p>
    <p v-if="channelDetails.isMember && channelDetails.messages.length <= 0" role="status" aria-live="assertive">No channel message, create a new message</p>
  </q-page>
</template>


<script setup>
import ShowPost from "src/components/posts/ShowPost.vue";
import WritePost from "src/components/posts/WritePost.vue";

import ChannelButton from "src/components/channel/ChannelButton.vue";
import ChannelSettings from "src/components/channel/ChannelSettings.vue";
import ChannelUserDetails from "src/components/channel/ChannelUserDetails.vue";
import CloseDialog from "src/components/utils/CloseDialog.vue";


import { searchChannel, userhandleToJson } from "src/common/requestsHandler";
import { provide } from 'vue'


import { useUserStore } from 'src/stores/user';
// import UserEnum from 'src/components/UserEnum.vue';
import { usePostStore } from "src/stores/post";
import { ref, onMounted, reactive, watch } from "vue";
import { useRouter } from "vue-router";


const postStore = usePostStore()

const router = useRouter()
const routerParam = router.currentRoute.value.params

/*
    "members": [],
    "editors": [],
    "memberRequests": [],
    "editorRequests": [],
*/
const channelDetails = reactive({
  name:"",
  description: NaN,
  creator: NaN,
  members_name: [],
  members: [],
  editors: [],
  member_requests: [],
  editor_requests: [],
  member_requests_json: [],
  editor_requests_json: [],
  messages: [],
  isEditor: false,
  isCreator: false,
  isMember: false,
  isPublic: false,
  isOfficial: false,
})
const member_readOnly = "true"
provide('channelDetails', channelDetails)

const myhandle=useUserStore().getUserHandle

const fetchChannelData = async (channelId) => {
  channelDetails.name=channelId
  const data = await searchChannel(channelId)
  // console.log("fetchChannelData res: ",data[0])
  if (data) {
    channelDetails.description = data[0].description
    channelDetails.creator = data[0].creator
    channelDetails.members_name = data[0].members

    channelDetails.isEditor = data[0].editors.includes(myhandle)
    channelDetails.isCreator = (data[0].creator === myhandle)
    // console.log("isEditor: ", channelDetails.isEditor)
    channelDetails.member_requests = data[0].memberRequests
    channelDetails.editor_requests = data[0].editorRequests
    channelDetails.isPublic=data[0].publicChannel
    channelDetails.isOfficial = data[0].official
    // const data2= await fetchMembers(data[0].members)
    const data2 = await userhandleToJson(data[0].members)
    const editor_json = await userhandleToJson(data[0].editors)
    const member_request_json = await userhandleToJson(data[0].memberRequests)
    const editor_requests_json = await userhandleToJson(data[0].editorRequests)


    channelDetails.members = data2
    channelDetails.editors = editor_json
    // console.log("members: ", JSON.parse(JSON.stringify(channelDetails.members)))
    channelDetails.member_requests_json = member_request_json
    channelDetails.editor_requests_json = editor_requests_json
    // console.log("member requests: ", JSON.parse(JSON.stringify(channelDetails.member_requests_json)))
    // console.log("editor requests: ", JSON.parse(JSON.stringify(channelDetails.editor_requests_json)))
    channelDetails.isMember = data[0].members.includes(myhandle)
    if(channelDetails.isMember || channelDetails.isOfficial){
      const channel_post = await postStore.fetchChannelPost(channelId)
      // console.log("get channel post: ",channel_post)
      channelDetails.messages = channel_post
    }

  }
}

watch(
  () => router.currentRoute.value.params,
  async (v) => {
    if (v.channelName) {
      fetchChannelData(v.channelName)
    }
  },
  {
    deep: false,
    immediate: true,
  }
);

watch(
  ()=> usePostStore().getSocketPost,
  (v)=>{

    if (routerParam && v.dest.includes("§"+routerParam.channelName)){
      channelDetails.messages.unshift(v)
    }
  },
  {
    deep: true,
  }
)

onMounted(() => {
  const paramId = routerParam.channelName;
  if (typeof paramId !== 'undefined') {
    // console.log("now you're searching informations for channel: ", paramId)
    fetchChannelData(paramId)
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
/* TODO: click to change background image */

.center-container
  display: flex
  justify-content: center
  margin-bottom: 2rem

.overlapping
  border: 2px solid white
  position: absolute
</style>
