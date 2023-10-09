<template>
  <router-view />
</template>

<script>
import { defineComponent } from 'vue'
import { usePostStore } from "src/stores/posts.js";
import { LocalStorage } from 'Quasar'

export default defineComponent({
  name: 'App',
  data() {
    return {
      postStore: usePostStore(),
    };
  },
  created() {
    if (LocalStorage.getItem('user')) {
      this.postStore.fetchPosts()
    }
  },
})


</script>
