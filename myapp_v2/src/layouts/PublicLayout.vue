<template>
  <q-layout view="lHr LpR fFf">
    <q-header elevated>
      <q-toolbar class="my-headerbar">
        <MyButton flat dense round icon="menu" aria-label="leftSideBar" @click="toggleLeftDrawer" />

        <q-toolbar-title>{{ $q.screen.width }} x {{ $q.screen.height }}, {{ miniStateR  }},{{ leftDrawerOpen }} {{ $q.screen.gt.xs && $q.screen.lt.md }}
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
          <EssentialLink class="nav-padding" v-for="link in essentialLinks" :key="link.title" v-bind="link" />
        </q-list>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-drawer :breakpoint="600"  :mini="miniStateR.value" @mouseover="miniStateR.value = false"
      @mouseout="miniStateR.value = !($q.screen.gt.xs && $q.screen.lt.md) ? false : true" :width="320" show-if-above
      v-model="rightDrawerOpen" side="right" bordered>
      <TrendsSideBar @mouseover="miniStateR.value = false"  v-show="rightDrawerOpen === true  && miniStateR.value == false && router.currentRoute.value.name != 'DisploreHashtagPublic'" class="q-ma-md"  />
      <ChannelSideBar @mouseover="miniStateR.value = false"  v-show="rightDrawerOpen === true  && miniStateR.value == false && router.currentRoute.value.name != 'DisploreChannelPublic'"  class="q-ma-md" />
      <q-icon name="fa-solid fa-arrow-trend-up" class="bg-grey-2 q-my-md round  q-px-md q-mini-drawer-only flex" size="xs"/>
      <q-icon name="fa-solid fa-users-rectangle" class="bg-grey-2 q-my-md q-px-md round q-mini-drawer-only flex " size="xs" />
    </q-drawer>

  </q-layout>
</template>

<script>
import { defineComponent, ref,reactive, onMounted, watch, computed, toRefs, onUnmounted } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import TrendsSideBar from "src/components/sidebar/TrendsSideBar.vue";
import ChannelSideBar from "src/components/sidebar/ChannelSideBar.vue";

const linksList = [
  {
    title: "home",
    icon: "home",
    link: "/public",
  },
  {
    title: "login",
    icon: "login",
    link: "/login"
  },
];


export default defineComponent({
  name: "PublicLayout",

  components: {
    EssentialLink,
    TrendsSideBar,
    ChannelSideBar,
},
  data() {
    return {
      router: useRouter(),
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

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      rightDrawerOpen,
      miniState,
      miniStateR,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      toggleRightDrawer(){
        rightDrawerOpen.value = !rightDrawerOpen.value
      }
    };
  },
  methods: {
    goHome(){
      this.router.push({
        name: "PublicPosts",
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

.my-logo
  margin-top:3rem
  margin-bottom: -2rem

</style>
