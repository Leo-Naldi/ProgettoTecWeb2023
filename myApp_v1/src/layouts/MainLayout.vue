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
      <div class="flex flex-center cursor-pointer" @click="gotoPage()">
        <img alt="Quasar logo" src="~assets/logo_48.png" class="my-logo">
      </div>
      <div class="my-nav">
        <q-list>
          <EssentialLink :unread_cnt="globalStore.getUnreadCnt" class="nav-padding" v-for="link in essentialLinks" :key="link.title" v-bind="link" />
        </q-list>
        <q-btn push v-if="leftDrawerOpen == true && miniState.value === false" unelevated rounded label="new" size="18px"
          class="q-px-xl q-py-xs q-my-md my-button">
        </q-btn>
        <q-btn v-else round icon="history_edu" class="q-my-md">
        </q-btn>
      </div>

      <q-list class="absolute-bottom my-info">

        <q-item class="cursor-pointer flex justify-between items-center  ">
          <q-avatar avatar>
            <img src="https://cdn.quasar.dev/img/avatar2.jpg">
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
        <q-input v-model="searchText" @keyup.enter="submit" placeholder="Search Qwitter" outlined rounded dense>
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <NotifyType ref="audio"></NotifyType>
  </q-layout>
</template>

<script>
import { defineComponent, ref,reactive, onMounted, watch, computed, toRefs, onUnmounted } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import { useQuasar } from "quasar";
import { LocalStorage } from "quasar";
import { useAuthStore } from 'src/stores/auth.js';
import { usePostStore } from "src/stores/posts";
import { useSocketStore } from "src/stores/socket";
import { useNotificationsStore } from 'src/stores/notifications';
import { useRouter } from "vue-router";
import NotifyType from "src/components/notify/NotifyType.vue";
import { useGlobalStore } from "src/stores/global";

const authStore = useAuthStore()
const globalStore = useGlobalStore()
const audio = ref();

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
    link: "/mychannel",
  },
  {
    title: "Bookmark",
    icon: "bookmark",
    link: "/bookmark",
  },
  {
    title: "User",
    icon: "person",
    link: "/user/details/" + authStore.getUserHandle(),
  },
  /*   {
      title: "Quasar",
      caption: "Community Quasar projects",
      icon: "favorite",
      link: "https://awesome.quasar.dev",
    }, */
  {
    title: "more",
    icon: "more_horiz",
  },
];


export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
    NotifyType
},
  data() {
    return {
      token: LocalStorage.getItem("token"),
      user: LocalStorage.getItem("user"),
      searchText: "",
      router: useRouter(),
    };
  },
  setup() {
    const leftDrawerOpen = ref(false);
    const rightDrawerOpen = ref(false);
    const $q = useQuasar();
    const notificationStore = useNotificationsStore()
    const socketStore = useSocketStore()
    const postStore = usePostStore()
    const mytoken = authStore.getToken()
    const myhandle = authStore.getUserHandle()
    socketStore.setSocket(myhandle, mytoken);
    const mysocket = socketStore.getSocket;
    const  userPost= ref([])
    let timerId =null

    const fetchUserData = async () => {
      userPost.value = await postStore.fetchUserPosts(myhandle);
    };



    const miniState = ref(computed(() => {
      return !($q.screen.gt.xs && $q.screen.lt.md) ? ref(false) : ref(true)
    }));
    const miniStateR = ref(computed(() => {
      return !($q.screen.gt.xs && $q.screen.lt.md) ? ref(false) : ref(true)
    }))

    onMounted(() => {
      fetchUserData();
      /*
        notify with socket, if not clicked then the notifications will save to store
        3 type of notify:
          - message send to me ("dest" include my "handle")
          - reply to my post ("answering" include my post's id)
          - reaction to my post
      */
      mysocket.on("message:created", (message) => {
        if (message.answering && userPost.value.some(obj => obj._id === message.answering) && message.dest && message.dest.includes("@"+myhandle)){
          notificationStore.set_c_unread(message)
          var new_MsgRe_sound ="/src/assets/newMsgRe.mp3"
          audio.value.show_notifications_ReMsg(new_MsgRe_sound, message.answering, message.id);
        }
        else if (message.answering && userPost.value.some(obj => obj._id === message.answering)) {     // if has replies to my messages
          notificationStore.set_c_unread(message)
          var new_reply_sound ="/src/assets/newReply.mp3"
          audio.value.show_notifications_reply(new_reply_sound, message.answering)
        }
        else if( message.dest && message.dest.includes("@"+myhandle)){                       // if has message send to me
          notificationStore.set_m_unread(message)
          var new_message_sound ="/src/assets/newMessage.mp3"
          audio.value.show_notifications_message(new_message_sound, message.id);
        }
        globalStore.incrementUnread()
      });

      mysocket.on("reaction:recived", (message) => {
        const foundObj = userPost.value.find(obj => obj.id === message.id);
        if (foundObj!=undefined) {
          notificationStore.set_r_unread(foundObj)
        }
        globalStore.incrementUnread()
      });

      /* every 30s check if there're unread messages, if clicked, jump to notification page */
      timerId = setInterval(() => {
        let sum = notificationStore.getUnread

        if (sum!= 0) {
          const notify_sound ="/src/assets/Notify.mp3"
          audio.value.show_notifications(notify_sound);
        }
      }, 30000); /* 1000 = 1s */
    }),
    onUnmounted(() => {
      clearInterval(timerId);
    });
    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      rightDrawerOpen,
      miniState,
      miniStateR,
      userPost,
      audio,
      globalStore,
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
    }
  }
});
</script>

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
