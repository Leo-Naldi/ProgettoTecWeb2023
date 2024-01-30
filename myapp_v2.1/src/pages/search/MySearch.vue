<template>
  <q-page padding>
    <!-- <q-separator size="0.25rem" color="grey-2" class="divider" /> -->
    <q-input class="q-pb-md" @keyup.enter="submit" v-model="searchText"
      placeholder="Please input the text that you want them show in results" outlined rounded dense>
      <!-- <div v-if="searchList.length > 0" class="history">
        <ul class="list">
          <li @click="$router.push({ path: '/searchbar', query: { item } })" v-for="(item, index) in searchList" :key="index"
            class="list-item">
            {{ item }}
            <i @click.stop="_deleteOne(index)" class="iconfont icon-chucuo"></i>
          </li>
        </ul>
        <div   class="clear">clear all history</div>
      </div> -->
      <q-menu fit v-if="searchList.length > 0">
        <q-list style="min-width: 100px">
          <q-item clickable v-for="(item, index) in searchList" :key="index" @click="fetchSearchResults(item)">
            <q-item-section>{{ item }}</q-item-section>
            <q-item-section side>
              <div class="alert-box-close" @click.stop="_deleteOne(index)" color="red">
                <i class="material-icons">close</i>
              </div>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item clickable>
            <q-item-section @click="_clear">
              <div class="clear">clear all history</div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
      <template v-slot:after>
        <!-- @click="showFilter()" -->
        <q-icon name="settings" class="cursor-pointer" @click.stop>
          <q-popup-proxy>
            <q-card class="my-card">
              <q-card-section>
                <div class="q-pt-md">
                  Don't show posts:<q-toggle v-model="tabFilter.showPosts" checked-icon="check" color="primary"
                    unchecked-icon="clear" />
                </div>
                <div class="q-pt-md">
                  Don't show channels:<q-toggle v-model="tabFilter.showChannels" checked-icon="check" color="primary"
                    unchecked-icon="clear" />
                </div>
                <div class="q-pt-md">
                  Don't show users:<q-toggle v-model="tabFilter.showUsers" checked-icon="check" color="primary"
                    unchecked-icon="clear" />
                </div>
                <div class="q-pt-md">
                  Don't show mentions:<q-toggle v-model="tabFilter.showMentions" checked-icon="check" color="primary"
                    unchecked-icon="clear" />
                </div>
                <div class="q-pt-md">
                  Don't show tags:<q-toggle v-model="tabFilter.showTags" checked-icon="check" color="primary"
                    unchecked-icon="clear" />
                </div>
              </q-card-section>
            </q-card>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <p>
      TODO: It seems that your search results contain many geolocations, do you
      want to view them on a map?
      <router-link :to="{
        path: '/map',
      }">Y
      </router-link>
    </p>
    <div>
      It seems that you've choosen some filters to search! click this button to
      confirm
      <q-btn size="sm" @click="useFilter = true" />
      <!-- <p>{{ searchFilter }}</p> -->
    </div>

    <!-- <q-scroll-area class="absolute full-width full-height"> -->
    <!-- <q-separator class="divider" color="grey-2" size="10px" /> -->
    <!-- <div class="column relative" style="height: 35rem"> -->
    <div class="col q-pa-xs">
      <q-item-label class="nav-option text-subtitle1 flex justify-around q-py-lg">
        <strong v-if="tabFilter.showPosts === true" @click="onActive('posts')" :style="[
          isActive === 'posts'
            ? { borderBottom: '2px solid #1da1f2' }
            : { borderBottom: '2px solid transparent' },
        ]"><q-icon style="margin: 0 -3px 3px 0" color="grey" name="reply_all" size="xs" />&ensp;Posts</strong>
        <strong v-if="tabFilter.showChannels === true" @click="onActive('channel')" :style="[
          isActive === 'channel'
            ? { borderBottom: '2px solid #1da1f2' }
            : { borderBottom: '2px solid transparent' },
        ]"><q-icon style="margin: 0 -3px 3px 0" color="grey" name="movie" size="xs" />&ensp;Channel</strong>
        <strong v-if="tabFilter.showUsers === true" @click="onActive('user')" :style="[
          isActive === 'user'
            ? { borderBottom: '2px solid #1da1f2' }
            : { borderBottom: '2px solid transparent' },
        ]"><q-icon style="margin: 0 -3px 3px 0" color="grey" name="person" size="xs" />&ensp;User</strong>
        <strong v-if="tabFilter.showMentions === true" @click="onActive('mention')" :style="[
          isActive === 'mention'
            ? { borderBottom: '2px solid #1da1f2' }
            : { borderBottom: '2px solid transparent' },
        ]"><q-icon style="margin: 0 -3px 6px 0" color="grey" name="@" size="xs" />&ensp;Mention</strong>
        <strong v-if="tabFilter.showTags === true" @click="onActive('tag')" :style="[
          isActive === 'tag'
            ? { borderBottom: '2px solid #1da1f2' }
            : { borderBottom: '2px solid transparent' },
        ]"><q-icon style="margin: 0 -3px 3px 0" color="grey" name="tag" size="xs" />&ensp;Tag</strong>
      </q-item-label>
      <!-- </div> -->
    </div>

    <div>
      <div v-if="isActive === 'posts'">
        <ShowPost v-for="post in searchResults.posts" :key="post._id" v-bind="post" clickable />
        <p v-if="searchResults.posts.length == 0" style="text-align: center; vertical-align: center">
          No result
        </p>
      </div>
      <div v-if="isActive === 'user'">
        <UserEnum :members="searchResults.users" clickable />
        <!-- <ShowPost v-for="user in searchResults.users" :key="user._id" v-bind="user" clickable/> -->
        <p v-if="searchResults.users.length == 0" style="text-align: center; vertical-align: center">
          No result
        </p>
      </div>
      <div v-if="isActive === 'channel'">
        <ChannelEnum :channels="searchResults.channels" clickable />
        <!-- <ShowPost v-for="channel in searchResults.channels" :key="channel._id" v-bind="channel" clickable/> -->
        <p v-if="searchResults.channels.length == 0" style="text-align: center; vertical-align: center">
          No result
        </p>
      </div>
      <div v-if="isActive === 'mention'">
        <ShowPost v-for="tag in searchResults.mentions" :key="tag._id" v-bind="tag" clickable />
        <p v-if="searchResults.mentions.length == 0" style="text-align: center; vertical-align: center">
          No result
        </p>
      </div>
      <div v-if="isActive === 'tag'">
        <ShowPost v-for="tag in searchResults.tags" :key="tag._id" v-bind="tag" clickable />
        <p v-if="searchResults.tags.length == 0" style="text-align: center; vertical-align: center">
          No result
        </p>
      </div>
    </div>
    <!-- </q-scroll-area> -->
  </q-page>
</template>

<script setup>
import {
  ref,
  onMounted,
  computed,
  reactive,
  watchEffect,
  watch,
  toRef,
} from "vue";
import { useRouter } from "vue-router";

import ShowPost from "src/components/posts/ShowPost.vue";
import UserEnum from "src/components/utils/UserEnum.vue";
import ChannelEnum from "src/components/channel/ChannelEnum.vue";
// import AlertBox from "src/components/AlertBox.vue";
import searchSideBar from "src/components/sidebar/searchSideBar.vue";

import { usePostStore } from "src/stores/post";

import {
  updateSearch,
  deleteOne,
  clear,
  getSearchList,
} from "src/common/localStorageHandler";
import { searchUser, searchChannel } from "src/common/requestsHandler";
import { LocalStorage } from "quasar";
import { useSearchStore } from "src/stores/search";

const router = useRouter();
const postStore = usePostStore();

const isActive = ref("posts");
// const searchText= ref("")
const tabFilter = reactive({
  showPosts: true,
  showChannels: true,
  showUsers: true,
  showMentions: true,
  showTags: true,
});

const searchText = router.currentRoute.value.params.searchText
  ? ref(router.currentRoute.value.params.searchText)
  : ref("");

const searchResults = reactive({
  posts: [],
  users: [],
  channels: [],
  tags: [],
  mentions: [],
});

const onActive = (nameLink) => {
  isActive.value = nameLink;
};

const useFilter = ref(false);
const searchFilter = computed(() => useSearchStore().getSearchFilter);

const fetchSearchResults = async (searchText) => {
  // console.log("【MySearch】的 fetchSearchResults 正在查找的词是：",searchText)
  // 是否传递 searchFilter， 如果是就调用searchPostsFiltered 否则就调用 searchPosts
  var filters = JSON.parse(JSON.stringify(toRef(searchFilter).value));  //把这个传递给定义的 API
  const es = {
    contains: { keywords: "www", mentions: "", text: "" },             // ?keywords=xxx, &mentions=xxx, &text=xxx
    from: { user: "" },                                                // &author=xxx
    to: { user: "", channel: "" },                                     // &query=xxx，必须有 @ 符号以及 § 符号
    timeFrame: { start: "2023-11-19 12:44", end: "2023-11-19 22:44" }, // &before=xxx&after=xxx（不等于这个默认值， ）

    count: { min_likes: "232132", min_dislikes: "21212" },  //
    media: true,  //搜索结果返回后再过滤
    reply: false, //同上
  };
  if(useFilter.value){
    // console.log("【MySearch.vue】接收到了新的搜索过滤：", filters,
    // "author: "+filters.from.user,
    // ", keyword: "+filters.contains.keywords.split(/\s*,\s*/),
    // ", mention: "+filters.contains.mentions.split(/\s*,\s*/),
    // ", text: "+filters.contains.text.split(/\s*,\s*/),
    // ", dest user: "+filters.to.user.split(/\s*,\s*/),
    // ", dest channel: "+filters.to.channel.split(/\s*,\s*/),
    // Object.keys(filters).length === 0, searchText);  // 判断是否返回了 {}
    filters.contains.text = searchText;
    // console.log("【fetchSearchResults】最终的请求 API 是：", filters)
    // console.log("【MySearch.vue】接收到了新的搜索过滤：", filters, searchText, filters.contains.keywords.split(/\s*,\s*/));  // 查找关键词可以有多个，用逗号分隔开
    searchResults.posts =  await usePostStore().searchPostsFiltered(filters)
  }
  else{
    updateSearch(searchText);
    getList();
    searchResults.posts = await postStore.searchPosts(searchText);
  }
  searchResults.tags = await postStore.searchHashtags(searchText);
  searchResults.mentions = await postStore.searchMentions(searchText);
  searchResults.users = await searchUser(searchText);
  searchResults.channels = await searchChannel(searchText);
};

const searchList = ref([]);
const submit = () => {
  if (searchText.value != "") {
    router.push({
      name: "searchWithParam",
      params: {
        searchText: searchText.value,
      },
    });
    // alert("submit!"+searchText.value)
    // fetchSearchResults(searchText.value)
  }
};

const getList = () => {
  if (LocalStorage.has("search")) {
    searchList.value = getSearchList();
  }
/*   console.log(
    "【MySearch】查看是否正确获得了本地的搜索历史（为什么没有弹出搜索历史框？）",
    searchList.value
  ); */
};

const _deleteOne = (index) => {
  deleteOne(index);
  getList();
};
const _clear = () => {
  clear();
  getList();
};

watch(
  () => router.currentRoute.value.params,
  async (v) => {
    if (v.searchText) {
      fetchSearchResults(v.searchText);
      console.log(
      "【MySearch】为什么搜了三次呢？是 watch 这里重复搜了两次！那么 watch 这里值的变化都是什么呢？",
      v.searchText
    )
    }
  },
  {
    deep: false,
    immediate: true,
  }
);

onMounted(() => {
  const paramId = router.currentRoute.value.params.searchText;
  if (paramId) {
    fetchSearchResults(paramId);
  }
  console.log("now you're searching for words: ", paramId);
  getList();
});
</script>

<style lang="sass" scoped>
strong
  cursor: pointer
  .history
    margin: 0px 0
    .list
      .list-item
        background-color: white
        padding: 5px 50px 5px 25px
        font-size: 16px
        border-bottom: 1px gainsboro solid
        position: relative
        overflow: hidden
        text-overflow: ellipsis
        height: 30px
        line-height: 30px

    .clear
      text-align: center
      color: gray
      background-color: white
      height: 45px
      line-height: 45px
      box-shadow: 1px 2px 2px gainsboro
</style>
