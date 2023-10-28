<template>
  <q-layout view="lHr LpR fFf">
    <q-header elevated>
      <q-toolbar class="my-headerbar">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>{{ $q.screen.width }} x {{ $q.screen.height }}, {{ $q.screen.gt.xs && $q.screen.lt.md }}
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>

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
          <EssentialLink class="nav-padding" v-for="link in essentialLinks" :key="link.title" v-bind="link" />
        </q-list>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
import { defineComponent, ref,reactive, onMounted, watch, computed, toRefs, onUnmounted } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

const linksList = [
  {
    title: "home",
    icon: "home",
    link: "/home",
  },
  {
    title: "login",
    icon: "login",
    link: "/login"
  },
];


export default defineComponent({
  name: "NoLoginLayout",

  components: {
    EssentialLink,
},
  data() {
    return {
      router: useRouter(),
    };
  },
  setup() {
    const leftDrawerOpen = ref(false);
    const $q = useQuasar();

    const miniState = ref(computed(() => {
      return !($q.screen.gt.xs && $q.screen.lt.md) ? ref(false) : ref(true)
    }));

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      miniState,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
  methods: {
    goHome(){
      this.router.push({
        name: "NoLogin",
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
