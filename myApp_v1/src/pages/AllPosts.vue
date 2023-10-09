<template>
  <!-- <q-page padding> -->
  <q-page class="relative-position">
    <q-list separator>
      <ShowPost style="border-radius:12px; margin: 0.4rem 0.2rem 0.3rem 0.2rem"  v-show="!post.hide" v-for="post in post_list" :key="post.id" v-bind="post" clickable @click="gotoDetail(post.id)" />
    </q-list>
  </q-page>
</template>

<script>
import ShowPost from "src/components/posts/ShowPost.vue";
import { usePostStore } from "src/stores/posts.js";
export default {
  name: "AllPosts",
  data() {
    return {
      postStore: usePostStore(),
    };
  },
  components: {
    ShowPost,
  },
  computed:{
    post_list(){
      return this.postStore.getPosts
    },
  },
  methods: {
    gotoDetail(id) {
      console.log("go to post's detail page!");
    },
  },
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
