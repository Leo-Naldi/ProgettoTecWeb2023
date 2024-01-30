<template>
  <div class="q-gutter-y-md" v-if="forRequests">

    <q-tabs v-model="request_tab" class="text-grey" active-color="primary" indicator-color="primary" narrow-indicator>
      <q-tab name="Member-Req" label="Member-Req" />
      <q-tab name="Editor-Req" label="Editor-Req" />
    </q-tabs>

    <q-tab-panels v-model="request_tab" animated>
      <q-tab-panel name="Member-Req">
        <UserEnum :request_member="true" :showAdminButton=showAdminButton :request_handler="true" />
      </q-tab-panel>

      <q-tab-panel name="Editor-Req">
        <UserEnum :request_editor="true" :showAdminButton=showAdminButton :request_handler="true" />
      </q-tab-panel>
    </q-tab-panels>
  </div>
  <div class="q-gutter-y-md" v-else>
    <q-tabs v-model="tab" class="text-grey" active-color="primary" indicator-color="primary" align="justify"
      narrow-indicator>
      <q-tab name="members" label="Members" />
      <q-tab name="editors" label="Editors" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="members">
        <UserEnum :admin_member="true" :showAdminButton=showAdminButton :member_handler="true"/>
      </q-tab-panel>

      <q-tab-panel name="editors">
        <UserEnum  :admin_editor="true" :showAdminButton=showAdminButton :member_handler="true" />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
import { ref } from 'vue'
import UserEnum from '../utils/UserEnum.vue';

export default {
  components: {
    UserEnum
  },
  props: {
    showAdminButton: {
      type: Boolean,
      default: false
    },
    forRequests: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    return {
      tab: ref('members'),
      request_tab: ref('Member-Req'),
    }
  }
}
</script>
