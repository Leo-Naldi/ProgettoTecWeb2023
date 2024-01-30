<template>
  <q-page class="relative-position">
      <p class="text-center" v-if="bookmark_list.length<=0">No bookmars yet!</p>
      <q-list v-else>
        <ShowPost style="border-radius:12px; margin: 0.4rem 0.2rem 0.3rem 0.2rem" v-show="!post.hide"
          v-for="post in bookmark_list" :key="post.id" v-bind="post" clickable />
      </q-list>
  </q-page>
</template>

<script setup>
import ShowPost from "src/components/posts/ShowPost.vue";
import { usePostStore } from "src/stores/post";
import { ref, computed, onMounted } from "vue"

const postStore = usePostStore()

const bookmark_list = computed(() => postStore.getBookmarks);

</script>
