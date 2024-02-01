<template>
  <q-item class="my-hover text-capitalize text-h6" clickable tag="a" :to="link" role="link" tabindex="0">
    <q-item-section v-if="icon" avatar>
      <q-badge v-if="icon == 'notifications'" class="my-badage" rounded :label="unread_cnt" />
      <q-icon size="md" :name="icon" aria-hidden="true"></q-icon>

    </q-item-section>

    <q-item-section class="between-icon">
      <q-item-label>{{ title }}</q-item-label>
    </q-item-section>
    <q-menu style="border-radius: 12px" v-if="icon == 'more_horiz'" role="menuitem" tabindex="0">
      <q-list>
        <q-item v-for="(item, i) in moreList" :key="i" v-close-popup clickable class="flex items-center">
          <router-link v-if="item.icon=== 'verified_user'" :to="{ path: item.address }" tabindex="-1">
            <q-icon :name="item.icon" class="q-mr-sm" aria-hidden="true" />
            <q-item-section>{{
              item.lable
            }}</q-item-section>
          </router-link>
          <div v-else>
            <q-icon :name="item.icon" class="q-mr-sm" aria-hidden="true" />
            <q-item-section><a :href="item.address" tabindex="-1">{{
              item.lable
            }}</a></q-item-section>
          </div>
        </q-item>
      </q-list>
    </q-menu>
  </q-item>
</template>

<script>
import { defineComponent,reactive } from 'vue'

export default defineComponent({
  name: 'EssentialLink',
  props: {
    title: {
      type: String,
      required: true
    },
    link: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    unread_cnt: {
      type: Number,
      default: -1
    }
  },
  setup() {
    return {
      moreList: reactive([
/*      TODO: all hashtags
        {
          lable: "Topics",
          icon: "assistant_photo",
          address: "/user/settings",
        }, */
        {
          lable: "SMM Dashboard",
          icon: "rocket_launch",
          address: "http://site222346.tw.cs.unibo.it/frontend/smmdashboard/",
        },
        {
          lable: "Mod Dashboard",
          icon: "equalizer",
          address: "http://site222346.tw.cs.unibo.it/frontend/moddashboard/",
        },
        {
          lable: "Settings",
          icon: "verified_user",
          address: "/user/settings",
        },
      ]),
    }
  }
})
</script>

<style lang="sass" scoped>
.my-hover
  border-radius: 99px

.my-hover:hover
  color: #1da1f2
  background-color: #e8f5ff
  box-sizing: border-box

.between-icon
  margin-left:0.2rem

.my-badage
  position: absolute
  top: 0.3rem
  left: 0.8rem
  background-color: red


</style>

<style scoped>
.router-link-active, a{
    text-decoration: none;
  color:black;
  }
</style>
