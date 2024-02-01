<template>
  <q-layout view="lHr LpR fFf" role="banner" aria-label="Main Layout">
    <q-header elevated>
      <q-toolbar class="my-headerbar">

        <MyButton role="button" class="sidebarbutton" flat dense round icon="menu" aria-label="leftSideBar" tabindex="0" @click="toggleLeftDrawer" />

        <MyButton role="button" class="sidebarbutton" dense flat round icon="menu" aria-label="rightSideBar" tabindex="0" @click="toggleRightDrawer" />


      </q-toolbar>
    </q-header>

    <q-drawer aria-label="Left Drawer" v-model="leftDrawerOpen" show-if-above :mini="miniState.value" @mouseover="miniState.value = false"
  @mouseout="miniState.value = !($q.screen.gt.xs && $q.screen.lt.md) ? false : true" :width="320" :breakpoint="600" bordered
  aria-labelledby="leftDrawerLabel">
  <div id="leftsDrawerLabel" style="display: none;">Right Drawer</div>
      <div class="flex flex-center cursor-pointer" @click="goHome()" tabindex="0">
        <img alt="Quasar logo, a squealer" src="~assets/images/logo_48.png" class="my-logo">
      </div>
      <div class="my-nav">
        <q-list ole="navigation">
          <EssentialLink role="menuitem" class="nav-padding" v-for="link in essentialLinks" :key="link.title" v-bind="link" />
        </q-list>
      </div>
    </q-drawer>

    <q-page-container role="main" aria-label="Page Content">
      <router-view />
    </q-page-container>

    <q-drawer aria-label="Right Drawer" :breakpoint="600" :mini="miniStateR.value" @mouseover="miniStateR.value = false"
  @mouseout="miniStateR.value = !($q.screen.gt.xs && $q.screen.lt.md) ? false : true" :width="320" show-if-above
  v-model="rightDrawerOpen" side="right" bordered aria-labelledby="rightDrawerLabel">
    <div id="rightDrawerLabel" style="display: none;">Right Drawer</div>
      <!-- <TrendsSideBar @mouseover="miniStateR.value = false"  v-show="rightDrawerOpen === true  && miniStateR.value == false && router.currentRoute.value.name != 'DisploreHashtagPublic'" class="q-ma-md"  /> -->
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
// import TrendsSideBar from "src/components/sidebar/TrendsSideBar.vue";
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
    // TrendsSideBar,
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
.sidebarbutton:focus,.sidebarbutton:focus-visible
  background-color: #ffcc00
  outline: 2px solid crimson
  border-radius: 3px
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
