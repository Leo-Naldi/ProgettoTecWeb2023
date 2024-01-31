<template>
  <q-page class="relative-position">
      <div class="tooltip" @click="resetSocketList()" v-if="socket_post_list.length > 0">
        <!-- <q-btn flat class="center" @click="showMore()">You have unread posts!</q-btn> -->
        <p class="center">You have unread posts!</p>
      </div>
      <q-list v-if="showSocket!=false">
        <ShowPost class="show-post" v-show="!post.hide" v-for="post in socket_list" :key="post.id" v-bind="post"
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


<script>
import { useRouter } from "vue-router";
import { ref, computed, onMounted, toRaw, reactive } from "vue"

import { useNotificationsStore } from "src/stores/notification";
import { usePostStore } from "src/stores/post.js";
import { useUserStore } from "src/stores/user";
import { useGlobalStore } from "src/stores/global";

import ShowPost from "src/components/posts/ShowPost.vue";

import { getUser } from "src/common/localStorageHandler";

export default {

  setup() {
    const hasCliked = computed(() => useGlobalStore().getHasClickedShowMore)
    const showSocket = ref(false)
    // const showMore = () => { useGlobalStore().setHasClickedShowMore() } // 之前的方法是记录是否点击过，现在的新方法是点击就清空 Socket_list，反正除了这里也没有其他地方会用到 Socket_list
    const socket_list = ref([])
    const counter = ref(1)
    const isDisabled = ref(false)
    const userJson = useUserStore().getUserJson
    const isLogged = useUserStore().user.user != '' || getUser() != null


    async function onLoad(index, done) {
      const res = isLogged ? await usePostStore().fetchPosts(userJson.liked, userJson.disliked) : await usePostStore().fetchOfficialPosts()
      if (res && res.length > 0) {
        done(); // 数据加载完成后调用 done() 函数
      } else {
        isDisabled.value = true; // 数据为空，禁用 infinite scroll
      }
    }
    const resetSocketList = () => {
      socket_list.value = socket_list.value.concat(usePostStore().getSocketPosts)
      showSocket.value = true
      // console.log("为什么点击后什么都没有展示？？", socket_list.value, usePostStore().getSocketPosts)
      usePostStore().resetSocketList()
    }

    return {
      router_name: useRouter().currentRoute.value.name,
      hasCliked,
      // showMore,
      resetSocketList,
      showSocket,
      socket_list,
      counter,
      isDisabled,
      onLoad,
      isLogged
    }

  },
  data() {
    const notPublic = this.router_name != 'Public'
    return {
      notPublic,
    }
  },
  components: {
    ShowPost
  },
  computed: {
    post_list() {
      if (this.isLogged) {
        return usePostStore().getPosts;
      } else {
        return usePostStore().getOfficialPosts
      }
    },
    socket_post_list() {
      return usePostStore().getSocketPosts
    }
  },
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
