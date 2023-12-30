<template>
  <q-layout view="lHr LpR fFf">
    <q-header elevated>
      <q-toolbar class="my-headerbar">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>{{ $q.screen.width }} x {{ $q.screen.height }}, {{ $q.screen.gt.xs && $q.screen.lt.md }}
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>

        <q-btn dense flat round icon="menu" aria-label="rightSideBar" @click="toggleRightDrawer" />

      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above :mini="miniState.value" @mouseover="miniState.value = false"
      @mouseout="miniState.value = !($q.screen.gt.xs && $q.screen.lt.md) ? false : true" :width="320" :breakpoint="600"
      bordered>
      <div class="flex flex-center cursor-pointer" @click="goHome()">
        <img alt="Quasar logo" src="~assets/logo_48.png" class="my-logo">
      </div>
      <div class="my-nav">
        <q-list>
          <EssentialLink :unread_cnt="globalStore.getUnreadCnt" class="nav-padding" v-for="link in essentialLinks"
            :key="link.title" v-bind="link" />
        </q-list>
        <q-btn push v-if="leftDrawerOpen == true && miniState.value === false" unelevated rounded label="new" size="18px"
          class="q-px-xl q-py-xs q-my-md my-button">
          <q-popup-proxy>
            <ShowDialog :stop-auto-msg="true">
              <WritePost :can-repeat="true"></WritePost>
            </ShowDialog>
          </q-popup-proxy>
        </q-btn>
        <q-btn v-else round icon="history_edu" class="q-my-md">
        </q-btn>
      </div>

      <q-list class="absolute-bottom my-info">

        <q-item class="cursor-pointer flex justify-between items-center  ">
          <q-avatar avatar>
            <img src="https://cdn.quasar.dev/img/avatar2.jpg">
            <div v-if="JSON.parse(user).verified">
              <q-icon name="fa-solid fa-circle-check" class="verified" size="1rem"/>
            </div>
          </q-avatar>

          <q-item-section class="my-avatar">
            <q-item-label class="text-weight-medium">{{ user ? JSON.parse(user).username : "Null" }}</q-item-label>
            <q-item-label caption>@{{ user ? JSON.parse(user).handle : "Null" }}</q-item-label>
          </q-item-section>
          <q-item-section side top>
            <q-item-label caption><q-btn flat round color="grey-5" icon="more_horiz" /></q-item-label>
          </q-item-section>
          <q-menu style="border-radius: 12px;" :offset="[-90, 0]">
            <!-- <q-menu style="border-radius: 1rem;" anchor="top middle" self="top middle"> -->
            <q-list>
              <q-item clickable v-close-popup @click="logout()">
                <q-item-section>Logout from @{{ user ? JSON.parse(user).handle : "Null" }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
      </q-list>
    </q-drawer>

    <q-drawer :breakpoint="600" :mini="miniStateR.value" @mouseover="miniStateR.value = false"
      @mouseout="miniStateR.value = !($q.screen.gt.xs && $q.screen.lt.md) ? false : true" :width="350" show-if-above
      v-model="rightDrawerOpen" side="right" bordered>
      <div v-if="router.currentRoute.value.name != 'searchPage'" class="col-9 q-gutter-md q-pa-md">
        <q-input v-model="searchText" @keyup.enter="submit" placeholder="Search " outlined rounded dense>
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <searchSideBar v-if="router.currentRoute.value.name === 'searchPage'" class="q-ma-md"></searchSideBar>
      <TrendPage class="q-ma-md" :trendList="trendList" />
      <followSideBar v-if="router.currentRoute.value.name != 'disploreChannel'" class="q-ma-md" :channels="allChannels">
      </followSideBar>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- <NotifyType ref="audio"></NotifyType> -->
  </q-layout>
</template>

<script>

import { defineComponent, ref, reactive, onMounted, watch, computed, toRefs, toRaw, onUnmounted } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import { useQuasar } from "quasar";
import { LocalStorage } from "quasar";
import { useAuthStore } from 'src/stores/auth.js';
import { useUserStore } from "src/stores/user";
import { useChannelStore } from "src/stores/channels";
import { usePostStore } from "src/stores/posts";
import { useSocketStore } from "src/stores/socket";
import { useNotificationsStore } from 'src/stores/notifications';
import { useRouter } from "vue-router";
import NotifyType from "src/components/notify/NotifyType.vue";
import { useGlobalStore } from "src/stores/global";

import ShowDialog from 'src/components/ShowDialog.vue';
import WritePost from "src/components/posts/WritePost.vue";
import TrendPage from "src/components/sidebar/TrendSideBar.vue";
import followSideBar from "src/components/sidebar/followSideBar.vue";
import searchSideBar from "src/components/sidebar/searchSideBar.vue";

const authStore = useAuthStore()
const userStore = useUserStore()
const globalStore = useGlobalStore()
// const audio = ref();
// const userHandle = userStore.getUser




export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
    ShowDialog,
    WritePost,
    // NotifyType,
    TrendPage,
    followSideBar,
    searchSideBar,
  },
  data() {
    return {
      token: LocalStorage.getItem("token"),
      user: LocalStorage.getItem("user"),
      searchText: "",
      // userHandle: userStore.getUser
    };
  },
  setup() {
    const leftDrawerOpen = ref(false);
    const rightDrawerOpen = ref(false);
    const $q = useQuasar();
    const router = useRouter()
    const postStore = usePostStore()


    const userHandle2 = computed(() => userStore.getUser).value

    const miniState = ref(computed(() => {
      return !($q.screen.gt.xs && $q.screen.lt.md) ? ref(false) : ref(true)
    }));
    const miniStateR = ref(computed(() => {
      return !($q.screen.gt.xs && $q.screen.lt.md) ? ref(false) : ref(true)
    }))
    const linksList = [
      {
        title: "home",
        icon: "home",
        link: "/home",
      },
      {
        title: "Search",
        icon: "search",
        link: "/Search",
      },
      {
        title: "Notify",
        icon: "notifications",
        link: "/notifications",
      },
      {
        title: "Channel",
        icon: "group",
        link: "/channel/user",
      },
      {
        title: "Bookmark",
        icon: "bookmark",
        link: "/user/bookmarks",
      },
      {
        title: "User",
        icon: "person",
        link: "/user/details/" + userHandle2,
      },

      {
        title: "more",
        icon: "more_horiz",
      },
    ]
    const hashtag_test_list = [
      {
        _id: "655b70e7a1062e68f7250704",
        content: {
          text: "but you konw, #test1 is a good person",
        },
        author: "fv",
        meta: {
          geo: {
            type: "Point",
            coordinates: [40.714224, -73.9614],
          },
          impressions: 1,
          created: "2023-11-20T14:44:55.741Z",
          lastModified: "2023-11-20T14:44:55.741Z",
        },
        publicMessage: true,
        official: false,
        reactions: {
          positive: 0,
          negative: 0,
        },
        dest: ["@fvPro"],
        id: "655b70e7a1062e68f7250704",
      },
      {
        _id: "655b70e7a1062e68f7250705",
        content: {
          text: "but you konw, #test2 is a good person",
        },
        author: "fv",
        meta: {
          geo: {
            type: "Point",
            coordinates: [34.03, -118.15],
          },
          impressions: 1,
          created: "2023-11-20T14:44:55.741Z",
          lastModified: "2023-11-20T14:44:55.741Z",
        },
        publicMessage: true,
        official: false,
        reactions: {
          positive: 0,
          negative: 0,
        },
        dest: ["@fvPro"],
        id: "655b70e7a1062e68f7250705",
      },
      {
        _id: "655b70e7a1062e68f7250706",
        content: {
          text: "but you konw, #test3 is a good person",
        },
        author: "fv",
        meta: {
          geo: {
            type: "Point",
            coordinates: [36.7783, -119.4179],
          },
          impressions: 1,
          created: "2023-11-20T14:44:55.741Z",
          lastModified: "2023-11-20T14:44:55.741Z",
        },
        publicMessage: true,
        official: false,
        reactions: {
          positive: 0,
          negative: 0,
        },
        dest: ["@fvPro"],
        id: "655b70e7a1062e68f7250706",
      },
      {
        _id: "655b70e7a1062e68f7250707",
        content: {
          text: "but you konw, #test4 is a good person",
        },
        author: "fv",
        meta: {
          geo: {
            type: "Point",
            coordinates: [51.5072, -0.1276],
          },
          impressions: 1,
          created: "2023-11-20T14:44:55.741Z",
          lastModified: "2023-11-20T14:44:55.741Z",
        },
        publicMessage: true,
        official: false,
        reactions: {
          positive: 0,
          negative: 0,
        },
        dest: ["@fvPro"],
        id: "655b70e7a1062e68f7250707",
      },
      {
        _id: "655b70e7a1062e68f7250708",
        content: {
          text: "but you konw, #test5 is a good person",
        },
        author: "fv",
        meta: {
          geo: {
            type: "Point",
            coordinates: [53.292, -2.1441],
          },
          impressions: 1,
          created: "2023-11-20T14:44:55.741Z",
          lastModified: "2023-11-20T14:44:55.741Z",
        },
        publicMessage: true,
        official: false,
        reactions: {
          positive: 0,
          negative: 0,
        },
        dest: ["@fvPro"],
        id: "655b70e7a1062e68f7250708",
      },
      {
        _id: "655b70e7a1062e68f7250709",
        content: {
          text: "but you konw, #test6 is a good person",
        },
        author: "fv",
        meta: {
          geo: {
            type: "Point",
            coordinates: [35.6764, 139.65],
          },
          impressions: 1,
          created: "2023-11-20T14:44:55.741Z",
          lastModified: "2023-11-20T14:44:55.741Z",
        },
        publicMessage: true,
        official: false,
        reactions: {
          positive: 0,
          negative: 0,
        },
        dest: ["@fvPro"],
        id: "655b70e7a1062e68f7250709",
      },
      {
        _id: "655b70e7a1062e68f7250710",
        content: {
          text: "but you konw, #test7 is a good person",
        },
        author: "fv",
        meta: {
          geo: {
            type: "Point",
            coordinates: [34.6937, 135.5023],
          },
          impressions: 1,
          created: "2023-11-20T14:44:55.741Z",
          lastModified: "2023-11-20T14:44:55.741Z",
        },
        publicMessage: true,
        official: false,
        reactions: {
          positive: 0,
          negative: 0,
        },
        dest: ["@fvPro"],
        id: "655b70e7a1062e68f7250710",
      },
      {
        _id: "655b70e7a1062e68f7250711",
        content: {
          text: "but you konw, #test8 is a good person",
        },
        author: "fv",
        meta: {
          geo: {
            type: "Point",
            coordinates: [44.4949, 11.3426],
          },
          impressions: 1,
          created: "2023-11-20T14:44:55.741Z",
          lastModified: "2023-11-20T14:44:55.741Z",
        },
        publicMessage: true,
        official: false,
        reactions: {
          positive: 0,
          negative: 0,
        },
        dest: ["@fvPro"],
        id: "655b70e7a1062e68f7250711",
      },
      {
        _id: "655b70e7a1062e68f7250712",
        content: {
          text: "but you konw, #test9 is a good person",
        },
        author: "fv",
        meta: {
          geo: {
            type: "Point",
            coordinates: [45.4642, 14.0154],
          },
          impressions: 1,
          created: "2023-11-20T14:44:55.741Z",
          lastModified: "2023-11-20T14:44:55.741Z",
        },
        publicMessage: true,
        official: false,
        reactions: {
          positive: 0,
          negative: 0,
        },
        dest: ["@fvPro"],
        id: "655b70e7a1062e68f7250712",
      },
      {
        _id: "655b70e7a1062e68f7250713",
        content: {
          text: "but you konw, #test10 is a good person",
        },
        author: "fv",
        meta: {
          geo: {
            type: "Point",
            coordinates: [43.7696, 11.2558],
          },
          impressions: 1,
          created: "2023-11-20T14:44:55.741Z",
          lastModified: "2023-11-20T14:44:55.741Z",
        },
        publicMessage: true,
        official: false,
        reactions: {
          positive: 0,
          negative: 0,
        },
        dest: ["@fvPro"],
        id: "655b70e7a1062e68f7250713",
      },
      {
        _id: "655b70e7a1062e68f7250714",
        content: {
          text: "but you konw, #test11 is a good person",
        },
        author: "fv",
        meta: {
          geo: {
            type: "Point",
            coordinates: [45.0535, 9.19266],
          },
          impressions: 1,
          created: "2023-11-20T14:44:55.741Z",
          lastModified: "2023-11-20T14:44:55.741Z",
        },
        publicMessage: true,
        official: false,
        reactions: {
          positive: 0,
          negative: 0,
        },
        dest: ["@fvPro"],
        id: "655b70e7a1062e68f7250714",
      },
    ]
    const trendList = ref([])

    const whichRoute = computed(() => router.currentRoute.value)

    const channelStore = useChannelStore()
    const allChannels = channelStore.getChannelLists

    onMounted(async () => {
      const res = await channelStore.fetchChannels()
      allChannels.value = res
      // console.log("fetch channel res: ", res)
      // console.log("current router: ", whichRoute)
      for (var tweet of hashtag_test_list) {
        // console.log("testdata is this: ",tweet)
        postStore.updateHashTag(tweet);
      }

      const origin_trend = postStore.getHashtagCountry
      const array_proxy = JSON.parse(JSON.stringify(origin_trend))
      const toRaw_proxy = toRaw(origin_trend)

      // console.log("getTredList proxy: ", origin_trend)
      // console.log("getTredList Json parse: ", array_proxy)
      // console.log("getTredList toRaw: ", toRaw_proxy)

      /* for (const key in toRaw_proxy) {
        console.log("?????????????????key ", key)
        const nestedJson = toRaw_proxy[key];
        console.log("??????????????????????nestedJson ", nestedJson)

        for (const nestedKey in nestedJson) {
          console.log("??????????????????????nestedKey ", nestedKey)
          const tmp = {
            country: key,
            tag: nestedKey,
            tweet: nestedJson[nestedKey],
          }
          console.log("??????????????????????tmpJson ", tmp)
          trendList.value.push(tmp);

          // console.log("convert single item: ", tmp)
        }
      } */
      await postStore.makeTrendObject(toRaw_proxy)
      // const final_trend = postStore.makeTrendObject(toRaw_proxy)
      console.log("getTredList2: ", trendList.value)


    })

    return {
      router,
      essentialLinks: linksList,
      leftDrawerOpen,
      rightDrawerOpen,
      miniState,
      miniStateR,
      // userPost,
      // audio,
      globalStore,
      allChannels,
      trendList,
      // trendList: reactive([
      //   {
      //     country: "Italy",
      //     tag: "#tiktok",
      //     tweet: "114K",
      //   },
      //   {
      //     country: "Italy",
      //     tag: "#NBA",
      //     tweet: "4,121",
      //   },
      //   {
      //     country: "Italy",
      //     tag: "#food",
      //     tweet: "12.6K",
      //   },
      //   {
      //     country: "US",
      //     tag: "#twitter",
      //     tweet: "1.6M",
      //   },
      //   {
      //     country: "JA",
      //     tag: "#osaka",
      //     tweet: "9260",
      //   },
      //   {
      //     country: "China",
      //     tag: "#NewYear",
      //     tweet: "62k",
      //   },
      //   {
      //     country: "EN",
      //     tag: "#bell",
      //     tweet: "11k",
      //   },
      // ]),
      /*
            hashtag test data
          */
      hashtag_test_list,
      has_read: false,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      toggleRightDrawer() {
        rightDrawerOpen.value = !rightDrawerOpen.value;
      },
    };
  },
  methods: {
    logout() {
      authStore.logout()
    },
    submit() {
      this.router.push({
        name: "searchPage",
        params: {
          searchText: this.searchText,
        },
      });
    },
    goHome() {
      this.router.push({
        name: "Home",
      });
    }
  }
});
</script>

<style lang="sass">
.verified
  position: absolute
  bottom: 0rem
  right: 0rem
  color: $light-blue-6
</style>

<style lang="sass" scoped>


.my-headerbar
  background-color: #ffffff
  color:#000000

.my-nav
  margin-top: 4rem
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
  overflow: hidden
  box-sizing: border-box

.nav-padding
  padding: 0.7rem

.my-button
  width: 200px
  height:48px
  background-color: #000000
  color: #f0f8ff
.my-button:hover
  color: #1da1f2
  background-color: #e8f5ff

.my-avatar
  margin-left: 0.8rem

.my-logo
  margin-top:3rem
  margin-bottom: -2rem

.my-info:hover
  background-color: #e8f5ff
  border-radius: 99px
</style>
