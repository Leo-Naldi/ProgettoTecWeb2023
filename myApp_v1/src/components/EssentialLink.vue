<template>
  <q-item class="my-hover text-capitalize text-h6" clickable tag="a" :to="link">
    <q-item-section v-if="icon" avatar>
      <q-badge v-if="icon == 'notifications'" class="my-badage" rounded :label="unread_cnt" />
      <q-icon size="md" :name="icon"></q-icon>

    </q-item-section>

    <q-item-section class="between-icon">
      <q-item-label>{{ title }}</q-item-label>
    </q-item-section>
    <q-menu style="border-radius: 12px" v-if="icon == 'more_horiz'">
      <q-list>
        <q-item v-for="(item, i) in moreList" :key="i" v-close-popup clickable class="flex items-center">
          <q-icon :name="item.icon" class="q-mr-sm" />
          <q-item-section @click="gotoPage(item)">{{
            item.lable
          }}</q-item-section>
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
        {
          lable: "Topics",
          icon: "assistant_photo",
          address: "",
        },
        {
          lable: "Twitter for Professionals",
          icon: "rocket_launch",
          address: "",
        },
        {
          lable: "Analytics",
          icon: "equalizer",
          address: "",
        },
        {
          lable: "Settings",
          icon: "verified_user",
          address: "Settings",
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
  // background-color: #1da1f2
  // color: #e8f5ff
  box-sizing: border-box

.between-icon
  margin-left:0.2rem

.my-badage
  position: absolute
  top: 0.3rem
  left: 0.8rem
  background-color: red


</style>
