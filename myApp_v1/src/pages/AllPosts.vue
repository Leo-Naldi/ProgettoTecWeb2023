<template>
  <q-page class="relative-position">
    <q-infinite-scroll @load="onLoad" :offset="250">
      <q-list>
        <ShowPost style="border-radius:12px; margin: 0.4rem 0.2rem 0.3rem 0.2rem" v-show="!post.hide"
          v-for="post in post_list" :key="post.id" v-bind="post" clickable />
      </q-list>
    </q-infinite-scroll>
  </q-page>
</template>

<script setup>
import ShowPost from "src/components/posts/ShowPost.vue";
import { usePostStore } from "src/stores/posts.js";
import { ref, computed, onMounted } from "vue"

const postStore = usePostStore()

const post_list = computed(() => postStore.getPosts);

const counter= ref(1)

async function onLoad (index,done){
  counter.value+=1
  await postStore.fetchPosts(counter.value)
  console.log(counter)
  done()
}
</script>
