<template>
  <q-layout view="lHr LpR fFf">
    <q-header elevated>
      <q-toolbar class="my-headerbar">
        <MyButton flat dense round icon="menu" aria-label="leftSideBar" @click="toggleLeftDrawer" />

        <q-toolbar-title>{{ $q.screen.width }} x {{ $q.screen.height }}, {{ miniStateR }},{{ leftDrawerOpen }} {{
          $q.screen.gt.xs && $q.screen.lt.md }}
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>

        <MyButton dense flat round icon="menu" aria-label="rightSideBar" @click="toggleRightDrawer" />


      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above :mini="miniState.value" @mouseover="miniState.value = false"
      @mouseout="miniState.value = !($q.screen.gt.xs && $q.screen.lt.md) ? false : true" :width="320" :breakpoint="600"
      bordered>
      <div class="flex flex-center cursor-pointer" @click="goHome()">
        <img alt="Quasar logo" src="~assets/images/logo_48.png" class="my-logo">
      </div>
      <div class="my-nav">
        <q-list>
          <EssentialLink :unread_cnt="unreadCnt" class="nav-padding" v-for="link in essentialLinks" :key="link.title"
            v-bind="link" />
        </q-list>
        <q-btn class="q-mini-drawer-hide q-px-xl q-py-xs q-my-md my-button" push @mouseover="miniState.value = false"
          v-if="leftDrawerOpen == true" unelevated rounded label="new" size="18px"
          @click="persistentWrite = true" />
        <q-btn round icon="history_edu" class="q-my-md q-mini-drawer-only" />
        <q-dialog v-model="persistentWrite" persistent transition-show="scale" transition-hide="scale">
          <q-card>
            <q-card-section class="row items-center q-pb-none">
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>
            <WritePost :canRepeat="true" />
            <q-card-actions class="bg-white">
              <q-space />
            </q-card-actions>

            <q-space />
            <q-space />

          </q-card>
        </q-dialog>
      </div>

            <q-list class="absolute-bottom my-info">

        <q-item class="cursor-pointer flex justify-between items-center  ">
          <q-avatar avatar>
            <img src="https://cdn.quasar.dev/img/avatar2.jpg">
             <div v-if="user.verified">
              <q-icon name="fa-solid fa-circle-check" class="verified" size="1rem" />
            </div>
          </q-avatar>

          <q-item-section class="my-avatar">
            <q-item-label class="text-weight-medium">{{ userName || "NaN" }}
              <div class="q-ml-sm rounded-rectangle" >
                <p style="display:inline">{{ user.admin? Admin:user.accountType }}</p>
              </div>
            </q-item-label>
            <q-item-label caption>@{{ userHandle || "NaN" }}</q-item-label>
          </q-item-section>
          <q-item-section side top>
            <q-item-label caption><q-btn flat round color="grey-5" icon="more_horiz" /></q-item-label>
          </q-item-section>
          <q-menu style="border-radius: 12px;" :offset="[-90, 0]">
            <q-list>
              <q-item clickable v-close-popup @click="logout()">
                <q-item-section>Logout from @{{ userHandle || "NaN" }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
      <NotifyHandler ref="audio"></NotifyHandler>
    </q-page-container>

    <q-drawer :breakpoint="600" :mini="miniStateR.value" @mouseover="miniStateR.value = false"
      @mouseout="miniStateR.value = !($q.screen.gt.xs && $q.screen.lt.md) ? false : true" :width="350" show-if-above
      v-model="rightDrawerOpen" side="right" bordered>
      <searchSideBar @mouseover="miniStateR.value = false"  v-show="rightDrawerOpen === true  && miniStateR.value == false && (router.currentRoute.value.name == 'searchWithParam' || router.currentRoute.value.name=='searchPage')" class="q-ma-md"/>
      <TrendsSideBar @mouseover="miniStateR.value = false"  v-show="rightDrawerOpen === true  && miniStateR.value == false && router.currentRoute.value.name != 'DisploreHashtag'" class="q-ma-md" />
      <ChannelSideBar @mouseover="miniStateR.value = false"   v-show="rightDrawerOpen === true  && miniStateR.value == false && router.currentRoute.value.name != 'DisploreChannel'" class="q-ma-md" />
      <q-icon name="fa-solid fa-arrow-trend-up" class="bg-grey-2 q-my-md round  q-px-md q-mini-drawer-only flex" size="xs"/>
      <q-icon name="fa-solid fa-users-rectangle" class="bg-grey-2 q-my-md q-px-md round q-mini-drawer-only flex " size="xs" />
      <q-icon name="fa-solid fa-arrow-trend-up" class="bg-grey-2 q-my-md round  q-px-md q-mini-drawer-only flex" size="xs"/>
    </q-drawer>

  </q-layout>
</template>

<script>
import { defineComponent, ref, reactive, onMounted, watch, computed, toRefs, onUnmounted } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import TrendsSideBar from "src/components/sidebar/TrendsSideBar.vue";
import ChannelSideBar from "src/components/sidebar/ChannelSideBar.vue";
import searchSideBar from "src/components/sidebar/searchSideBar.vue";
import { useGlobalStore } from "src/stores/global";
import { useUserStore } from "src/stores/user";
import { useAccountStore } from "src/stores/account";
import { usePostStore } from "src/stores/post";
import { useChannelStore } from "src/stores/channel";
import WritePost from "src/components/posts/WritePost.vue";
import { LocalStorage } from "quasar";
import { removePublicPosts, removeUser } from "src/common/localStorageHandler";
import {useNotificationsStore} from "src/stores/notification"
import NotifyHandler from "src/components/notify/NotifyHandler.vue";

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
    title: "Map",
    icon: "map",
    link: "/map/search",
  },
  {
    title: "Notify",
    icon: "notifications",
    link: "/notifications",
  },
  {
    title: "Channel",
    icon: "group",
    link: "/user/channel",
  },
  {
    title: "Bookmark",
    icon: "bookmark",
    link: "/user/bookmarks",
  },
  // {
  //   title: "User",
  //   icon: "person",
  //   link: "/user/details/" + this.userHandle,
  // },

  {
    title: "more",
    icon: "more_horiz",
  },
]


export default defineComponent({
  name: "PublicLayout",

  components: {
    EssentialLink,
    TrendsSideBar,
    ChannelSideBar,
    searchSideBar,
    WritePost,
    NotifyHandler
  },
  data() {
    return {
      router: useRouter(),
      userHandle: useUserStore().getUserHandle,
      userName: useUserStore().getUserName,
      user: useUserStore().getUserJson
    };
  },
  setup() {
    const leftDrawerOpen = ref(false);
    const rightDrawerOpen = ref(false);

    const $q = useQuasar();

    const miniState = ref(computed(() => {
      return !($q.screen.gt.xs && $q.screen.lt.md) ? ref(false) : ref(true)
    }));
    const miniStateR = ref(computed(() => {
      return !($q.screen.gt.xs && $q.screen.lt.md) ? ref(false) : ref(true)
    }))

    const persistentWrite = ref(false)
    const audio = ref()
    const noti_Reply = computed(()=> useNotificationsStore().getPlayReac.cnt)
    const noti_Reply_id = computed(()=> useNotificationsStore().getPlayReac.id)
    const unreadCnt = computed(()=>useGlobalStore().getUnreadCnt)

    // watch if there are reactions to my message
    watch(
      () => useNotificationsStore().getPlayReac.cnt,
      (oldV, newV) => {
        if (oldV !== newV) {
          console.log("[MainLayout] you have a new reaction!", oldV, newV, audio.value);
          var sound_to_play = "/src/assets/newReply.mp3";
          audio.value.show_notifications_reply(
            sound_to_play,
            useNotificationsStore().getPlayReac.id
          );
        }
      },
    )

    // watch if there are replies to my message
    watch(
      () => useNotificationsStore().getPlayRe.cnt,
      (oldV, newV) => {
        if (oldV !== newV) {
          console.log("[MainLayout] you have a new reply!", oldV, newV, audio.value);
          var sound_to_play = "/src/assets/newMessage.mp3";
          audio.value.show_notifications_reply(
            sound_to_play,
            useNotificationsStore().getPlayRe.id
          );
        }
      },
    )

    // watch if someone send me a message
    watch(
      () => useNotificationsStore().getPlayNew.cnt,
      (oldV, newV) => {
        if (oldV !== newV) {
          console.log("[MainLayout] you have a new message!", oldV, newV, audio.value);
          var sound_to_play = "/src/assets/newMessage.mp3";
          audio.value.show_notifications_reply(
            sound_to_play,
            useNotificationsStore().getPlayNew.id
          );
        }
      },
    )

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      rightDrawerOpen,
      miniState,
      miniStateR,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      toggleRightDrawer() {
        rightDrawerOpen.value = !rightDrawerOpen.value
      },
      persistentWrite,
      audio,
      noti_Reply,
      noti_Reply_id,
      unreadCnt
    };
  },
  methods: {
    goHome() {
      if (this.router.currentRoute.value.name != 'Public') {
        this.router.push({
          name: "Home",
        });
      } else {
        this.router.push({
          name: "PublicPosts",
        });
      }
    },
    logout(){
      useUserStore().clearUser();
      usePostStore().resetStoreLogged();
      useChannelStore().resetStoredChannelLogged()
      removeUser();
      this.router.push({ name: "Public" });
    }
  },
  async mounted(){
    await useChannelStore().fetchChannels()
  }
});
</script>

<style lang="sass" scoped>
.rounded-rectangle
  border-radius: 10px
  display: inline-block
  background-color: #1da1f2
  color: white
  padding: 0.3rem

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

.my-logo
  margin-top:3rem
  margin-bottom: -2rem

</style>
