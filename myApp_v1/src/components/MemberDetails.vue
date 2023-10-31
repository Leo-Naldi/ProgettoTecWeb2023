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
        <q-tab-panel name="members">
          <UserEnum :users=users :for-channel="true" />
          <UserEnum :users=users :for-channel="true" />
          <UserEnum :users=users :for-channel="true" />
          <UserEnum :users=users :for-channel="true" />
        </q-tab-panel>

        <q-tab-panel name="editors">
          <UserEnum :users=users :for-channel="true" />
          <UserEnum :users=users :for-channel="true" />
          <UserEnum :users=users :for-channel="true" />
          <UserEnum :users=users :for-channel="true" />
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
    users: {
      type: Array,
      required: true
    },
  },
  setup() {
    return {
      tab: ref('members')
    }
  }
}
</script>
