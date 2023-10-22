<template>
  <!-- <q-page padding> -->
  <q-page class="relative-position">
    <q-list>
      <ShowPost style="border-radius:12px; margin: 0.4rem 0.2rem 0.3rem 0.2rem" v-show="!post.hide"
        v-for="post in post_list" :key="post.id" v-bind="post" clickable />
    </q-list>
  </q-page>
</template>

<script>
import ShowPost from "src/components/posts/ShowPost.vue";
import { usePostStore } from "src/stores/posts.js";
import { useChannelStore } from "src/stores/channels.js";
import { useAuthStore } from 'src/stores/auth';
import { LocalStorage } from 'Quasar'
import { useRouter } from "vue-router";


export default {
  name: "AllPosts",
  data() {
    return {
      postStore: usePostStore(),
      router: useRouter(),
    };
  },
  components: {
    ShowPost,
  },
  computed: {
    post_list() {
      return this.postStore.getPosts
    },
  },
  methods: {
  }
};
</script>

<!-- <script setup>
import ShowPost from "src/components/posts/ShowPost.vue";
import { usePostStore } from "src/stores/posts.js";
import { ref, computed, onMounted } from "vue"

const postStore = usePostStore()

const post_list = computed(() => postStore.getPosts);

const gotoDetail = (id) => { console.log("去详细页了！") }

</script> -->
