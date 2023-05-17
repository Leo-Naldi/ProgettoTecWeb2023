<template>
  <q-layout view="lHr lpR fFf">
    <q-header bordered class="bg-white text-black">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="left = !left" />

        <q-toolbar-title class="text-weight-bold">
          <span class="gt-sm">{{ $route.name }}</span>
          <q-icon
            class="header-icon q-pa-md lt-md"
            name="fas fa-dove"
            size="sm"
            color="primary"
          />
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="left" side="left" :width="283" bordered show-if-above>
      <q-icon class="q-pa-md" name="fas fa-dove" size="lg" color="primary" />

      <q-list>
        <q-item to="/" v-ripple clickable exact>
          <q-item-section avatar>
            <q-icon name="Home" size="md" />
          </q-item-section>

          <q-item-section class="text-h6 text-weight-bold">Home</q-item-section>
        </q-item>
        <q-item to="/profile" v-ripple clickable exact>
          <q-item-section avatar>
            <q-icon name="Profile" size="md" />
          </q-item-section>

          <q-item-section class="text-h6 text-weight-bold"
            >Profile</q-item-section
          >
        </q-item>
        <q-item to="/about" v-ripple clickable exact>
          <q-item-section avatar>
            <q-icon name="help" size="md" />
          </q-item-section>

          <q-item-section class="text-h6 text-weight-bold"
            >About</q-item-section
          >
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="more_horiz" size="sm" />
          </q-item-section>
          <q-item-section class="text-weight-bold text-capitalize text-h6">
            More
            <q-menu>
              <q-list>
                <q-item
                  v-for="(item, i) in moreList"
                  :key="i"
                  v-close-popup
                  clickable
                  class="flex items-center"
                >
                  <q-icon :name="item.icon" class="q-mr-sm" />
                  <q-item-section @click="gotoPage(item)">{{ item.lable }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- tweet shortcut: switch to home page -->
      <div class="flex justify-center q-my-md">
        <q-btn
          no-caps
          :ripple="{ color: 'yellow' }"
          rounded
          color="blue-7"
          label="Post new tweet"
          class="no-shadow"
          padding="sm lg"
          to="/"
        />
      </div>

      <!-- login, logout, register, TODO:update user avatar -->
      <q-list class="bottom">
        <q-item
          class="cursor-pointer flex justify-between items-center q-px-lg"
        >
          <q-icon name="account_circle" size="lg" />
          <q-item-section>
            <!-- TODO:if user have setted a username then show username, default show user handle-->
            <q-item-label class="text-weight-medium">{{
              store ? store.user.handle: ''
            }}</q-item-label>
            <q-item-label caption>@{{ store? store.user.handle:'' }}</q-item-label>
          </q-item-section>
          <q-item-section side top>
            <q-item-label caption
              ><q-btn
                flat
                round
                :color="isMore ? 'primary' : 'grey-5'"
                icon="more_horiz"
            /></q-item-label>
          </q-item-section>
          <!-- switch account/logout -->
          <q-menu v-model="showing">
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup to="/login">
                <q-item-section>Add an existing account (for now: login)</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="logout">
                <q-item-section
                  >Logout from @{{ store ? store.user.handle:'' }}</q-item-section
                >
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
      </q-list>
    </q-drawer>

    <q-drawer :width="283" show-if-above v-model="right" side="right" bordered>
      <div class="col-9 q-gutter-md q-pa-md">
        <q-input
          placeholder="Search Qwitter"
          class="q-ma-md"
          outlined
          rounded
          dense
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-list padding separator class="you-might-like-container bg-grey-2">
          <q-item class="q-pa-md">
            <q-item-section>
              <q-item-label overline class="text-grey">News?1</q-item-label>
              <q-item-label class="text-weight-bold"
                >Somethings amazing happend</q-item-label
              >
              <q-item-label caption
                >Secondary line text. Lorem ipsum dolor sit amet, consectetur
                adipiscit elit.</q-item-label
              >
            </q-item-section>
            <q-item-section side top>
              <q-item-label caption>5 min ago</q-item-label>
            </q-item-section>
          </q-item>

          <q-item class="q-pa-md">
            <q-item-section>
              <q-item-label overline class="text-grey">News?2</q-item-label>
              <q-item-label class="text-weight-bold"
                >Somethings amazing happend</q-item-label
              >
              <q-item-label caption
                >Secondary line text. Lorem ipsum dolor sit amet, consectetur
                adipiscit elit.</q-item-label
              >
            </q-item-section>
            <q-item-section side top>
              <q-item-label caption>5 min ago</q-item-label>
            </q-item-section>
          </q-item>
          <p class="text-blue q-px-md cursor-pointer">Show more</p>
        </q-list>
        <PageTrend />
      </div>

    </q-drawer>

    <q-page-container>
      <keep-alive>
        <router-view />
      </keep-alive>
    </q-page-container>
  </q-layout>
</template>

<script>
import { useUserStore } from "stores/user";

export default {
  data() {
    return {
      store: useUserStore(),
      left: false,
      right: false,
    };
  },
  methods:{
    logout(){
      if (localStorage.getItem("token") != null){
        localStorage.clear(),
        window.location.reload()
      }
    },
    gotoPage(item) {
      this.$router.push({name: item.address})
    }
  }
};
</script>

<script setup>
import { reactive } from "vue";
import PageTrend from "../components/PageTrend.vue";
const moreList = reactive([
  {
    lable: "Topics",
    icon: "assistant_photo",
    address: ''
  },
  {
    lable: "Twitter for Professionals",
    icon: "rocket_launch",
    address: ''
  },
  {
    lable: "Analytics",
    icon: "equalizer",
    address: ''
  },
  {
    lable: "Settings",
    icon: "verified_user",
    address: 'Settings'
    // only this page is clickable
  },
]);
</script>

<style lang="sass">
.header-icon
  position: absolute
  bottom: 0
  left: 50%
  transform: translateX(-50%)
</style>
