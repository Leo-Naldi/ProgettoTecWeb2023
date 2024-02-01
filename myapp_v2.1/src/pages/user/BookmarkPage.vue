<template>
  <q-page class="relative-position" role="region" aria-label="Bookmarked Posts">
    <p class="text-center" v-if="bookmark_list.length <= 0" role="status" aria-live="assertive">
      No bookmarks yet!
    </p>
    <q-list v-else role="list" aria-live="polite">
      <ShowPost
        style="border-radius: 12px; margin: 0.4rem 0.2rem 0.3rem 0.2rem"
        v-show="!post.hide"
        v-for="post in bookmark_list"
        :key="post.id"
        v-bind="post"
        clickable
        role="listitem"
        aria-label="Bookmarked Post"
      />
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
