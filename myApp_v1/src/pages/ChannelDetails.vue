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
      <channel-button :channel_name=$route.params.channelName style="box-sizing: content-box; font-size:15px" />
    </div>
    <p>editors: {{ channelDetails.editors }}</p>

    <div clickable class="cursor-pointer" style="display:flex; align-items:center; justify-content:space-between; ">
      <div class="q-pa-md q-gutter-sm" style="height: 80px">
        <q-avatar v-for="n in channelDetails.members_name.length" :key="n" size="40px" class="overlapping"
          :style="`left: ${n * 25}px`">
          <img :src="`https://cdn.quasar.dev/img/avatar${n + 1}.jpg`">
        </q-avatar>

        <div style="margin-left: 12rem; margin-top: 1rem;">
          <a>{{ channelDetails.members_name.length }}</a>&nbsp; members
        </div>

        <q-popup-proxy>
          <ShowDialog >
            <!-- <div class="flex flex-center" style="width: 400px;position:absolute;"> -->
            <!-- <ShowDialog><UserEnum :users="channelDetails.members"/></ShowDialog> -->
            <!-- </div> -->
              <MemberDetails :users="channelDetails.members"/>
          </ShowDialog>
        </q-popup-proxy>

      </div>

      <div style="order:2" v-if="channelDetails.isEditor">
        <q-btn flat round icon="settings"  class="cursor-pointer" >
          <q-popup-proxy>
          <ShowDialog>
              <!-- <MemberDetails :users="channelDetails.members"/> -->
              <ChannelSettings :channel-name="channelDetails.name" :users="channelDetails.members"  :member_requests="channelDetails.member_requests"></ChannelSettings>
          </ShowDialog>
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

    <q-separator class="divider" color="grey-2" size="10px" />

    <q-list separator>
      <ShowPost v-for="post in channelDetails.messages" :key="post.id" v-bind="post" clickable />

    </q-list>
    <p v-if="!channelDetails.isMember && channelDetails.messages.length <= 0">You're not a member, you cannot see the messages!</p>
    <p v-if="channelDetails.isMember && channelDetails.messages.length <= 0">No channel message, create a new message</p>
    <!-- </q-scroll-area> -->
  </q-page>
</template>


<script setup>
import ChannelButton from 'src/components/ChannelButton.vue';
import { useChannelStore } from 'src/stores/channels.js';
import { useAuthStore } from 'src/stores/auth';
import { useUserStore } from 'src/stores/user';
import UserEnum from 'src/components/UserEnum.vue';
import { usePostStore } from 'src/stores/posts';
import { ref, onMounted, reactive } from "vue";
import ShowPost from "src/components/posts/ShowPost.vue";
import ShowDialog from "src/components/ShowDialog.vue";
import { useRouter } from "vue-router";
import MemberDetails from 'src/components/MemberDetails.vue';
import ChannelSettings from 'src/components/ChannelSettings.vue';

const channelStore = useChannelStore()
const postStore = usePostStore()
const userStore = useUserStore()
const authStore = useAuthStore()
const router = useRouter();
const tab = ref('members')

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
  messages: [],
  isEditor: false,
  isMember: false //Error from backend: "message": "Not a member of §daily_news"
})

const myhandle=authStore.getUser().handle
// const isEditor = channelDetails.editors.includes(myhandle)

const fetchChannelData = async (channelId) => {
  channelDetails.name=channelId
  const data = await channelStore.searchChannel(channelId)
  console.log("data:", data)
  if (data.length > 0) {
    channelDetails.description = data[0].description
    channelDetails.creator = data[0].creator
    channelDetails.members_name = data[0].members

    channelDetails.editors = data[0].editors
    channelDetails.isEditor = data[0].editors.includes(myhandle)
    // console.log("isEditor: ", channelDetails.isEditor)
    // channelDetails.member_requests = data[0].memberRequests
    channelDetails.editor_requests = data[0].editorRequests
    // const data2= await fetchMembers(data[0].members)
    const data2 = await userStore.getUserArr(data[0].members)
    const member_request_json = await userStore.getUserArr(data[0].memberRequests)


    channelDetails.members = data2
    channelDetails.member_requests = member_request_json
    console.log("member requests: ", data[0])
    console.log("member requests: ", channelDetails.member_requests)
    channelDetails.isMember = data[0].members.includes(myhandle)
    if(channelDetails.isMember){
      const data = await postStore.fetchChannelPost(channelId)
  channelDetails.messages = data
    }

  }
}

const fetchChannelMessages = async (channelId) => {
  const data = await postStore.fetchChannelPost(channelId)
  channelDetails.messages = data
}

const showFilter = () => {
  console.log("channel settings")
}

onMounted(() => {
  const paramId = router.currentRoute.value.params.channelName;
  if (typeof paramId !== 'undefined') {
    console.log("now you're searching informations for channel: ", paramId)
    fetchChannelData(paramId)
    // fetchChannelMessages(paramId)
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
