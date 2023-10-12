<template>
  <q-page >
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
    <p><a class="display: flex">{{ channelDetails.members }}</a>&nbsp; members</p>
  </div>
  <div class="center-container">

  <channel-button channel_name="$route.params.channelName"/>
  </div>


    <!-- <q-scroll-area class="absolute full-width full-height"> -->
      <!--

    if the channel creator, display "Edit", click to jump to the page of editing the channel;
    If not a channel member, display "follow", click to become a member of this channel;
    If you are a channel member, display "unfollow", click to exit from the current channel's membership
   -->

      <q-separator class="divider" color="grey-2" size="10px" />


    <!-- </q-scroll-area> -->
  </q-page>
</template>


<script setup>
import ChannelButton from 'src/components/ChannelButton.vue';
import { useChannelStore } from 'src/stores/channels.js';
import { ref, onMounted, reactive } from "vue";

const channelStore= useChannelStore()

const channelDetails = reactive({
  description:null,
  creator:null,
  members:null
})

const fetchData = async () => {
  const data = await channelStore.searchChannel("daily_news")
  channelDetails.description=data[0].description
  channelDetails.creator=data[0].creator
  channelDetails.members = data[0].members.length

}

onMounted(()=>{
  fetchData()
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
</style>
