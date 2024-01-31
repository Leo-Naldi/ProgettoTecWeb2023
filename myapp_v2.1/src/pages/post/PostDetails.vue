<template>
  <q-page padding>
    <ShowPost v-for="post2 in postInfo.post" :key="post2.id" :replies=postInfo.replies :showReply="true" v-bind="post2" />
    <q-separator class="divider" color="grey-2" size="10px" />
    <router-view :key="router.fullPath"></router-view>

    <WritePost :author="postInfo.author" :id="postInfo.id"/>

    <q-separator class="divider" color="grey-2" size="10px" />

    <q-list separator>
      <ShowPost v-for="post in postInfo.replies" :key="post.id" v-bind="post" clickable />

    </q-list>
    <p v-if="postInfo.replies.length <= 0" class="flex flex-center">No replies!</p>
  </q-page>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch, onUnmounted } from "vue";

import ShowPost from "src/components/posts/ShowPost.vue";
import WritePost from "src/components/posts/WritePost.vue";

import { usePostStore } from "src/stores/post";

import { useRouter } from "vue-router";

const router = useRouter()

const postInfo = reactive({
  post: null,
  author: "",
  replies: [],
  id: ""
})

const fetchPost = async (id) => {
  const data = await usePostStore().fetchPost(id)
  postInfo.post = data
  postInfo.author=data[0].author
  postInfo.id = data[0].id
}

const fetchPostReplies = async (id) => {
  const data = await usePostStore().fetchReplis(id)
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

watch(
  ()=> usePostStore().getSocketPost,
  (v)=>{
    var routerParam = router.currentRoute.value.params
    if (routerParam && JSON.parse(JSON.stringify(v)).answering === routerParam.postId){
      postInfo.replies.unshift(v)
    }
  },
  {
    deep: true,
  }
)

onMounted(() => {
  const paramId = router.currentRoute.value.params.postId;
  if (typeof paramId !== 'undefined') {
    fetchPost(paramId);
    fetchPostReplies(paramId)
  }

});


</script>
