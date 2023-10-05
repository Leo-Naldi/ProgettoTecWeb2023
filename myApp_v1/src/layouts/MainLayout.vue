<template>
  <q-layout view="lHr LpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>{{ $q.screen.width }} 宽度 x {{ $q.screen.height }} 高度, {{ $q.screen.gt.xs && $q.screen.lt.md }},
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>

        <q-btn dense flat round icon="menu" aria-label="rightSideBar" @click="toggleRightDrawer" />

      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above :mini="miniState.value" @mouseover="miniState.value = false"
      @mouseout="miniState.value = !($q.screen.gt.xs && $q.screen.lt.md) ? false : true" :width="280" :breakpoint="600" bordered class="bg-grey-3">
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-drawer :breakpoint="600" :mini="miniStateR.value" @mouseover="miniStateR.value = false"
      @mouseout="miniStateR.value = !($q.screen.gt.xs && $q.screen.lt.md) ? false : true" :width="280" show-if-above v-model="rightDrawerOpen" side="right" bordered>
      <div class="col-9 q-gutter-md q-pa-md">
        <q-input placeholder="Search Qwitter" outlined rounded dense>
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, onMounted, watch, computed, toRefs } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import { useQuasar } from "quasar";

const linksList = [
  {
    title: "Docs",
    caption: "quasar.dev",
    icon: "school",
    link: "https://quasar.dev",
  },
  {
    title: "Github",
    caption: "github.com/quasarframework",
    icon: "code",
    link: "https://github.com/quasarframework",
  },
  {
    title: "Discord Chat Channel",
    caption: "chat.quasar.dev",
    icon: "chat",
    link: "https://chat.quasar.dev",
  },
  {
    title: "Forum",
    caption: "forum.quasar.dev",
    icon: "record_voice_over",
    link: "https://forum.quasar.dev",
  },
  {
    title: "Twitter",
    caption: "@quasarframework",
    icon: "rss_feed",
    link: "https://twitter.quasar.dev",
  },
  {
    title: "Facebook",
    caption: "@QuasarFramework",
    icon: "public",
    link: "https://facebook.quasar.dev",
  },
  {
    title: "Quasar Awesome",
    caption: "Community Quasar projects",
    icon: "favorite",
    link: "https://awesome.quasar.dev",
  },
];


export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
  },
  setup() {
    const leftDrawerOpen = ref(false);
    const rightDrawerOpen = ref(false);
    const $q= useQuasar();
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
      toggleRightDrawer() {
        rightDrawerOpen.value = !rightDrawerOpen.value;
      },
    };
  },
});
</script>
