<template>

  <!-- <p> {{usePostStore().getTrendList}} </p> -->

  <q-page class="relative-position">
    <div class="tooltip" @click="showMore()"
      v-if="!hasCliked && socket_post_list.length > 0 && router.currentRoute.value.name == 'Public'">
      <!-- <q-btn flat class="center" @click="showMore()">You have unread posts!</q-btn> -->
      <p class="center">You have unread posts!</p>

    </div>
    <q-list v-if="hasCliked===true && router.currentRoute.value.name == 'Public'">
      <ShowPost class="show-post" v-show="!post.hide" v-for="post in socket_post_list" :key="post.id" v-bind="post"
        clickable />
    </q-list>
    <!-- <q-infinite-scroll @load="onLoad" :offset="250"> -->
    <q-infinite-scroll @load="onLoad" :offset="250" :disable="isDisabled">
      <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner color="primary" name="dots" size="40px" />
        </div>
      </template>
      <!-- <q-list> -->
      <ShowPost style="border-radius:12px; margin: 0.4rem 0.2rem 0.3rem 0.2rem" v-show="!post.hide"
        v-for="post in post_list" :key="post.id" v-bind="post" clickable />
      <!-- </q-list> -->
    </q-infinite-scroll>
    <p v-if="isDisabled">You've loaded all data!</p>


  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, toRaw, reactive } from "vue"
import { useRouter } from "vue-router";

import ShowPost from "src/components/posts/ShowPost.vue";

import { usePostStore } from "src/stores/post.js";
import { useNotificationsStore } from "src/stores/notification";
import { useGlobalStore } from "src/stores/global";
import { useHashtagStore } from "src/stores/hashtags";

const { getOfficialPosts, fetchOfficialPosts, getPosts } = usePostStore()
const { getPublicUnread } = useNotificationsStore()
const { setHasClickedShowMore, getHasClickedShowMore, hasClickedShowMore } = useGlobalStore()
const postStore = usePostStore()
const notificationStore= useNotificationsStore()
const globalStore= useGlobalStore()

const test_reactive = reactive({ "US": { "#3": 2, "#mam": 1 }, "JP": { "#2": 1, "#1": 1 }, "IT": { "#2": 1, "#mam": 1 }, "GB": { "#mam": 1, "#4": 1 } })

const router = useRouter()


let post_list = null
if(router.currentRoute.value.name != 'Public'){
  post_list= computed(() => postStore.getPosts);
}
else{
  post_list = computed(() => postStore.getOfficialPosts);
}
const socket_post_list = computed(() => notificationStore.getPublicUnread)
const hasCliked = computed(() => globalStore.getHasClickedShowMore)

const showMore= ()=>{globalStore.setHasClickedShowMore()}


const counter = ref(1)
const isDisabled = ref(false)

async function onLoad(index, done) {
  const res = await fetchOfficialPosts(counter.value)
  if (res.length > 0) {
    counter.value += 1
    done(); // 数据加载完成后调用 done() 函数
  } else {
    isDisabled.value = true; // 数据为空，禁用 infinite scroll
  }
  console.log("current pages are: ", counter.value)

}


</script>




<style scoped lang="sass">

.tooltip
  height: 50px
  display: flex
  align-items: flex-end
  justify-content: center
  background-color: #f7f7f7
  cursor: pointer

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



<!--

  <template>
  <q-page class="relative-position">
    <div class="tooltip" @click="showMore()"
      v-if="!hasCliked && socket_post_list.length > 0 && router.currentRoute.value.name == 'Public'">
      <p class="center">You have unread posts!</p>

    </div>
    <q-list v-if="hasCliked === true && router.currentRoute.value.name == 'Public'">
      <ShowPost class="show-post" v-show="!post.hide" v-for="post in socket_post_list" :key="post.id" v-bind="post"
        clickable />
    </q-list>
    <q-infinite-scroll @load="onLoad" :offset="250" :disable="isDisabled">
      <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner color="primary" name="dots" size="40px" />
        </div>
      </template>
      <ShowPost style="border-radius:12px; margin: 0.4rem 0.2rem 0.3rem 0.2rem" v-show="!post.hide"
        v-for="post in post_list" :key="post.id" v-bind="post" clickable />
    </q-infinite-scroll>
    <p v-if="isDisabled">You've loaded all data!</p>


  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, toRaw, reactive } from "vue"
import { useRouter } from "vue-router";

import ShowPost from "src/components/posts/ShowPost.vue";

import { usePostStore } from "src/stores/post.js";
import { useNotificationsStore } from "src/stores/notification";
import { useGlobalStore } from "src/stores/global";
import { useUserStore } from "src/stores/user";


const router = useRouter()

const notPublic = router.currentRoute.value.name != 'Public'
const post_list = notPublic==true ?computed(()=>usePostStore().getPosts) : computed(()=>usePostStore().getOfficialPosts)
const socket_post_list = notPublic==true ? computed(()=>useNotificationsStore().getUnread): computed(() => useNotificationsStore().getPublicUnread)

const hasCliked = computed(() => useGlobalStore().getHasClickedShowMore)


const showMore = () => { useGlobalStore().setHasClickedShowMore() }

const counter = ref(1)
const isDisabled = ref(false)
const userJson = useUserStore().getUserJson


async function onLoad(index, done) {
  const res = useUserStore().getUserName != null? await usePostStore().fetchPosts({liked: userJson.liked, disliked: userJson.disliked}) :  await usePostStore().fetchOfficialPosts()
  if (res.length > 0) {
    done(); // 数据加载完成后调用 done() 函数
  } else {
    isDisabled.value = true; // 数据为空，禁用 infinite scroll
  }
  console.log("current pages are: ", index)

}


</script>










<style scoped lang="sass">

.tooltip
  height: 50px
  display: flex
  align-items: flex-end
  justify-content: center
  background-color: #f7f7f7
  cursor: pointer

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

 -->
