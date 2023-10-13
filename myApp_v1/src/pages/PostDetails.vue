<template>
  <q-page padding>
    <ShowPost v-for="post2 in postInfo.post" :key="post2.id" v-bind="post2" />
    <!-- <q-btn @click="pressMe">pressMe</q-btn> -->
    <q-separator class="divider" color="grey-2" size="10px" />
    <router-view :key="router.fullPath"></router-view>

    <!-- <NewShowPost :author="info.post[0].author"></NewShowPost> -->
    <WritePost></WritePost>

    <q-separator class="divider" color="grey-2" size="10px" />

    <q-list separator>
      <ShowPost v-for="post in postInfo.replies" :key="post.id" v-bind="post" clickable />

    </q-list>
    <p v-if="postInfo.replies.length <= 0">没有相关回复</p>
  </q-page>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from "vue";
import { usePostStore } from "src/stores/posts";
import ShowPost from "src/components/posts/ShowPost.vue";
import WritePost from "src/components/posts/WritePost.vue";

import { useRouter } from "vue-router";

const router = useRouter();
const postStore = usePostStore()

const postInfo = reactive({
  post: null,
  replies: []
})

const fetchPost = async (id) => {
  const data = await postStore.fetchPost(id)
  postInfo.post = data
}

const fetchPostReplies = async (id) => {
  const data = await postStore.fetchReplis(id)
  postInfo.replies = data
}



watch(
  () => router.currentRoute.value.params,
  async (v) => {
    if (v.postId) {
      fetchPost(v.postId)
      fetchPostReplies(v.postId)
    }
  },
  {
    deep: false,
    immediate: true,
  }
);

/* watch(
  () => fetchPostReplies(router.currentRoute.value.params),
  (oldstate, newstate) => {
  },
  {
    deep: false,
    immediate: true,
  }
); */

onMounted(() => {
  const paramId = router.currentRoute.value.params.postId;
  if (typeof paramId !== 'undefined') {
    console.log("now you're searching post: ", paramId);
    fetchPost(paramId);
    fetchPostReplies(paramId);
  }
});
</script>
