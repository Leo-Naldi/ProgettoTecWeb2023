<template>
  <div>
    <div class="q-gutter-y-md">

      <q-tabs v-model="tab" class="text-grey"  active-color="primary" indicator-color="primary"
        narrow-indicator>
        <q-tab name="Member-Req" label="Member-Req" />
        <q-tab name="Editor-Req" label="Editor-Req" />
      </q-tabs>



      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="Member-Req" >
          <UserEnum :users=member_requests :channel_name=channel_name :forRequests=forRequests :request_member="true" />
          <!-- <UserEnum :users=member_requests :forRequests=forRequests :request_member="true" />
          <UserEnum :users=member_requests :forRequests=forRequests :request_member="true"  />
          <UserEnum :users=member_requests :forRequests=forRequests :request_member="true"  /> -->

        </q-tab-panel>

        <q-tab-panel name="Editor-Req">
          <UserEnum :users=editor_requests :channel_name=channel_name :forRequests=forRequests :request_editor="true" />
          <!-- <UserEnum :users=member_requests :forRequests=forRequests :request_editor="true"  />
          <UserEnum :users=member_requests :forRequests=forRequests :request_editor="true"  />
          <UserEnum :users=member_requests :forRequests=forRequests :request_editor="true"  /> -->
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>

<!--   <q-card flat square>
      <q-card-section class="q-pa-none q-py-md row">
        <div>
          <q-tabs v-model="settingsTab" align="left" active-color="primary" active-bg-color="blue-1" class="text-grey-10"
            vertical>
            <q-tab name="a1" label="1" style="justify-content: left" content-class="q-pl-md" />
            <q-tab name="a2" label="2" style="justify-content: left" content-class="q-pl-md" />

          </q-tabs>
        </div>
        <div class="col-sm col-xs-12 q-px-md q-pt-none">
          <q-tab-panels v-model="settingsTab" animated transition-prev="fade" transition-next="fade">
            <q-tab-panel name="a1" class="row q-pt-sm">
              <UserEnum :users=member_requests  />
            </q-tab-panel>
            <q-tab-panel name="a2" class="q-pt-sm">
              <UserEnum :users=member_requests  />
            </q-tab-panel>

          </q-tab-panels>
        </div>
      </q-card-section>
    </q-card> -->
</template>

<script>
import { ref } from 'vue'
import UserEnum from '../UserEnum.vue';

export default {
  components:{
    UserEnum
  },
  props:{
    member_requests: {
      type: Array,
      required: true
    },
    editor_requests:{
      type: Array,
      required: true
    },
    channel_name: {
      type: String,
      default: ""
    },
    forRequests: {
      type: Boolean,
      default: false
    },
  },
  data(){
    return{
      settingsTab: 'Member-Req',

    }
  },
  setup() {
    return {
      tab: ref('Member-Req'),
    }
  }
}
</script>
