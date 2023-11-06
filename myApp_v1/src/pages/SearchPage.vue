<template>
  <q-page padding>
    <!-- <q-separator size="0.25rem" color="grey-2" class="divider" /> -->
    <q-input class="q-pb-md" @keyup.enter="submit" v-model="searchText" placeholder="Search " outlined rounded
      dense>
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
      <template v-slot:after>
        <q-icon name="settings" @click="showFilter()" class="cursor-pointer" />
      </template>
    </q-input>

    <AlertBox>TODO: It seems that your search results contain many geolocations, do you want to view them on a map?
      <router-link :to="{
        path: '/map'
      }">Y </router-link>
    </AlertBox>
    <!-- <q-scroll-area class="absolute full-width full-height"> -->
    <!-- <q-separator class="divider" color="grey-2" size="10px" /> -->
    <!-- <div class="column relative" style="height: 35rem"> -->
    <div class="col q-pa-xs">
      <q-item-label class="nav-option text-subtitle1 flex justify-around q-py-lg">
        <strong @click="onActive('posts')" :style="
          [
            isActive === 'posts'
              ? { borderBottom: '2px solid #1da1f2' }
              : { borderBottom: '2px solid transparent' },
          ]
        "><q-icon style="margin: 0 -3px 3px 0" color="grey" name="reply_all" size="xs" />&ensp;Posts</strong>
        <strong @click="onActive('channel')" :style="
          [
            isActive === 'channel'
              ? { borderBottom: '2px solid #1da1f2' }
              : { borderBottom: '2px solid transparent' },
          ]
        "><q-icon style="margin: 0 -3px 3px 0" color="grey" name="movie" size="xs" />&ensp;Channel</strong>
        <strong @click="onActive('user')" :style="
          [
            isActive === 'user'
              ? { borderBottom: '2px solid #1da1f2' }
              : { borderBottom: '2px solid transparent' },
          ]
        "><q-icon style="margin: 0 -3px 3px 0" color="grey" name="person" size="xs" />&ensp;User</strong>
        <strong @click="onActive('mention')" :style="
          [
            isActive === 'mention'
              ? { borderBottom: '2px solid #1da1f2' }
              : { borderBottom: '2px solid transparent' },
          ]
        "><q-icon style="margin: 0 -3px 6px 0" color="grey" name="@" size="xs" />&ensp;Mention</strong>
        <strong @click="onActive('tag')" :style="
          [
            isActive === 'tag'
              ? { borderBottom: '2px solid #1da1f2' }
              : { borderBottom: '2px solid transparent' },
          ]
        "><q-icon style="margin: 0 -3px 3px 0" color="grey" name="tag" size="xs" />&ensp;Tag</strong>
      </q-item-label>
      <!-- </div> -->
    </div>

    <div>
      <div v-if=" isActive === 'posts' ">
        <ShowPost v-for=" post  in  searchResults.posts " :key=" post._id " v-bind=" post " clickable />
        <p v-if=" searchResults.posts.length == 0 " style="text-align: center; vertical-align:center">No result</p>
      </div>
      <div v-if=" isActive === 'user' ">
        <UserEnum :users=" searchResults.users " clickable />
        <!-- <UserEnum :handle="user.handle" :username="user.username" clickable/> -->
        <!-- <ShowPost v-for="user in searchResults.users" :key="user._id" v-bind="user" clickable/> -->
        <p v-if=" searchResults.users.length == 0 " style="text-align: center; vertical-align:center">No result</p>
      </div>
      <div v-if=" isActive === 'channel' ">
        <ChannelEnum :channels=" searchResults.channels " clickable />
        <!-- <ShowPost v-for="channel in searchResults.channels" :key="channel._id" v-bind="channel" clickable/> -->
        <p v-if=" searchResults.channels.length == 0 " style="text-align: center; vertical-align:center">No result</p>
      </div>
      <div v-if=" isActive === 'mention' ">
        <ShowPost v-for=" tag  in  searchResults.mentions " :key=" tag._id " v-bind=" tag " clickable />
        <p v-if=" searchResults.mentions.length == 0 " style="text-align: center; vertical-align:center">No result</p>
      </div>
      <div v-if=" isActive === 'tag' ">
        <ShowPost v-for=" tag  in  searchResults.tags " :key=" tag._id " v-bind=" tag " clickable />
        <p v-if=" searchResults.tags.length == 0 " style="text-align: center; vertical-align:center">No result</p>
      </div>
    </div>
    <!-- </q-scroll-area> -->
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watchEffect, watch } from "vue";
import { useRouter } from "vue-router";
import ShowPost from "src/components/posts/ShowPost.vue";
import UserEnum from "src/components/UserEnum.vue";
import ChannelEnum from "src/components/ChannelEnum.vue";
import AlertBox from "src/components/AlertBox.vue";
import { usePostStore } from "src/stores/posts";
import { useUserStore } from "src/stores/user";
import { useChannelStore } from "src/stores/channels";

const router = useRouter();
const postStore = usePostStore()
const userStore = useUserStore()
const channelStore = useChannelStore()

const isActive = ref("posts");
// const searchText= ref("")
const searchText = router.currentRoute.value.params.searchText ? ref(router.currentRoute.value.params.searchText) : ref("")

const searchResults = reactive({
  posts: [],
  users: [],
  channels: [],
  tags: [],
  mentions: []
})


const onActive = (nameLink) => {
  isActive.value = nameLink;
};

const showFilter = (() => {
  alert("popup proxy filter!")
})

const fetchSearchResults = async (searchText) => {
  searchResults.posts = await postStore.searchPosts(searchText)
  searchResults.tags = await postStore.searchHashtags(searchText)
  searchResults.mentions = await postStore.searchMentions(searchText)
  searchResults.users = await userStore.searchUser(searchText)
  searchResults.channels = await channelStore.searchChannel(searchText)
  // // console.log("searchPage,searching: ", searchText)
  // console.log("searchPage, searchChannelRes: ", searchResults.channels)
}

const submit = (() => {
  if (searchText.value != "") {
    router.push({
      name: "searchPage",
      params: {
        searchText: searchText.value,
      },
    });
    // alert("submit!"+searchText.value)
    // fetchSearchResults(searchText.value)
  }
})

watch(
  () => router.currentRoute.value.params,
  async (v) => {
    fetchSearchResults(v.searchText)
  },
  {
    deep: false,
    immediate: true,
  }
);

onMounted(() => {
  const paramId = router.currentRoute.value.params.searchText;
  fetchSearchResults(paramId)
  console.log("now you're searching for words: ", paramId)
})
</script>

<style lang="sass" scoped>
strong
  cursor: pointer

</style>
