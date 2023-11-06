<template>
  <div>
    <div class="q-gutter-y-md">
      <q-tabs v-model="tab" class="text-grey" active-color="primary" indicator-color="primary" align="justify"
        narrow-indicator>
        <q-tab name="members" label="Members" />
        <q-tab name="editors" label="Editors" />
      </q-tabs>

      <!-- <q-separator /> -->

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="members" >
          <UserEnum :users=members :channel_name=channel_name :forAdmin=forAdmin :admin_member="true" />
          <!-- <UserEnum :users=users :forAdmin=forAdmin  />
          <UserEnum :users=users :forAdmin=forAdmin  />
          <UserEnum :users=users :forAdmin=forAdmin  /> -->
        </q-tab-panel>

        <q-tab-panel name="editors">
          <UserEnum :users=editors :channel_name=channel_name :forAdmin=forAdmin :admin_editor="true"  />
          <!-- <UserEnum :users=users :forAdmin=forAdmin  />
          <UserEnum :users=users :forAdmin=forAdmin  />
          <UserEnum :users=users :forAdmin=forAdmin  /> -->
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import UserEnum from './UserEnum.vue';

export default {
  components:{
    UserEnum
  },
  props:{
    members: {
      type: Array,
      required: true
    },
    editors:{
      type: Array,
      required: true
    },
    channel_name: {
      type: String,
      default: ""
    },
    forAdmin: {
      type: Boolean,
      default: false
    },
  },
  setup() {
    return {
      tab: ref('members')
    }
  }
}
</script>
