<template>
  <q-page class="relative-position">
    <div class="tooltip" @click="showMore" v-if="!hasCliked && socket_post_list.length>0">
      <p class="center">You have unread posts!</p>
    <!-- <AlertBox class="show-tooltip" @click="showMore" v-if="clickShowMore==false">You have new Messssage!</AlertBox> -->
  </div>
      <q-list v-if="hasCliked">
      <ShowPostPublic class="show-post" v-show="!post.hide"
        v-for="post in socket_post_list" :key="post.id" v-bind="post" clickable />
    </q-list>
    <q-list>
      <ShowPostPublic style="border-radius:12px; margin: 0.4rem 0.2rem 0.3rem 0.2rem" v-show="!post.hide"
        v-for="post in post_list" :key="post.id" v-bind="post" clickable />
    </q-list>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import ShowPostPublic from "src/components/posts/ShowPostPublic.vue";
import AlertBox from "src/components/AlertBox.vue";

import { usePostStore } from "src/stores/posts.js";
import { useNotificationsStore } from "src/stores/notifications";
import { useGlobalStore } from "src/stores/global";

const postStore = usePostStore()
const notificationStore= useNotificationsStore()
const globalStore= useGlobalStore()

const post_list = computed(() => postStore.getOfficialPosts);
const socket_post_list = computed(() => notificationStore.getPublicUnread)
const hasCliked = computed(() => globalStore.getHasClickedShowMore)

const showMore= ()=>{globalStore.setHasClickedShowMore()}

</script>

<style scoped lang="sass">

.tooltip
  height: 50px
  display: flex
  align-items: flex-end
  justify-content: center
  background-color: #f7f7f7

.show-tooltip
  position: absolute
  // top: 5rem
  // // left: 2rem
  width: 300px
  top: 2%
  left: 20%
  text-align: center
  // transform: translate(-50%, -50%)
  z-index: 2
.show-post
  border-radius:12px
  margin: 0.4rem 0.2rem 0.3rem 0.2rem
</style>
