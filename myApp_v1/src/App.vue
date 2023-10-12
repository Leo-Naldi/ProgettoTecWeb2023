<template>
  <router-view />
</template>

<script>
import { defineComponent } from 'vue'
import { usePostStore } from "src/stores/posts.js";
import { useChannelStore } from "src/stores/channels.js";
import { useAuthStore } from './stores/auth';
import { LocalStorage } from 'Quasar'

export default defineComponent({
  name: 'App',
  data() {
    return {
      postStore: usePostStore(),
      authStore: useAuthStore(),
      channelStore: useChannelStore(),
    };
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
})


</script>
