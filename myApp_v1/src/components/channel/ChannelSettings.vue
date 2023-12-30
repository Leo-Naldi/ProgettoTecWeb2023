<template>
  <div>
    <!-- <div class="q-px-md"> -->
    <q-card flat square>
      <!-- <q-card-section class="q-pa-none q-py-md row"> -->
      <q-card-section class="q-pa-none row">
        <!-- <div class="col-sm-6 col-xs-12 q-pb-sm"> -->
        <div v-if="$q.screen.gt.xs">
          <q-tabs v-model="settingsTab" align="left" active-color="primary" active-bg-color="blue-1" class="text-grey-10"
            vertical>
            <q-tab name="see-members" label="members" style="justify-content: left" content-class="q-pl-md" />
            <q-tab name="see-requests" label="requests" style="justify-content: left" content-class="q-pl-md" />

            <q-tab name="channelSettings" label="channel settings" style="justify-content: left"
              content-class="q-pl-md" />


            <q-tab name="deleteChannel" label="Delete Channel" style="justify-content: left" content-class="q-pl-md" />

          </q-tabs>
        </div>
        <!-- <q-separator :vertical="$q.screen.gt.xs" v-show="$q.screen.gt.xs" /> -->
        <!-- <div class="col  q-pt-none"> -->
        <div :class="$q.screen.gt.xs ? 'col  q-pt-none' : 'q-ma-md'" style="min-width: 350px">
          <!-- <div class="col-sm col-xs-12 q-px-md q-pt-none"> -->
          <q-tab-panels :swipeable="$q.screen.gt.xs ? false : true" :infinite="$q.screen.gt.xs ? false : true"
            v-model="settingsTab" animated transition-prev="fade" transition-next="fade">
            <q-tab-panel name="see-members" class=" q-pt-none">
              <div v-if="!$q.screen.gt.xs" class="text-h6 q-pb-md text-blue"
                style="display:flex;  justify-content: center;">Members</div>
              <MemberDetails :channel_name=channelName :members=members :editors=editors :forAdmin="true" />
            </q-tab-panel>
            <q-tab-panel name="see-requests" class="q-pt-sm">
              <div v-if="!$q.screen.gt.xs" class="text-h6 q-pb-md text-blue"
                style="display:flex;  justify-content: center;">Requests</div>
              <RequestsDetails :channel_name=channelName :editor_requests=editor_requests :member_requests=member_requests
                :forRequests="true" />
            </q-tab-panel>
            <q-tab-panel name="channelSettings" class="q-pt-sm">
              <div class="text-h5 col-12 q-mb-md text-blue-6" style="cursor: help">Channel Settings<q-tooltip
                  class="bg-grey text-body2" :offset="[10, 10]">
                  If you do not want to change one of them, please leave them empty
                </q-tooltip></div>
              <!--               <div class="lt-sm col-xs-12 q-mb-md">
                <span class="text-center block">
                  <q-img src="../assets/head.png" width="180px" :ratio="10 / 10" />
                </span>
                <span class="text-center block">
                  <q-btn unelevated color="primary" label="change avatar" icon="unarchive" />
                </span>
              </div> -->
              <div class="col-md-4 col-sm-5 col-xs-12 q-gutter-y-md q-pt-md q-pl-md q-pb-md">
                <q-form @submit="submitChanneldata()" class="q-gutter-md">
                  <q-input class="col" outlined dense square label="name" v-model="channelData.name" />

                  <q-input type="textarea" outlined dense square label="personal descriptions"
                    v-model="channelData.description" />

                  <div><q-checkbox v-model="channelData.isPrivate" label="Set Private" /></div>

                  <q-btn label="update data" type="submit" color="primary" unelevated />
                </q-form>
              </div>
              <!--               <div class="gt-xs col-md-8 col-sm-7">
                <span class="text-center block">
                  <q-img src="../assets/head.png" width="180px" :ratio="10 / 10" />
                </span>
                <span class="text-center block">
                  <q-btn unelevated color="primary" label="change avatar" icon="unarchive" />
                </span>
              </div> -->
            </q-tab-panel>

            <q-tab-panel name="deleteChannel" class="q-pt-sm">
              <div class="text-h5 col-12 q-mb-md">Delete this channel</div>
              <q-form @submit="deleteChannel()" class="q-mt-md">
                <p>Please insert below the channel name to delete this channel</p>
                <q-input class="col" outlined dense rounded label="name" v-model="confirmDeleteChannel">

                  <q-dialog v-model="confirmDeleteChannelRes" persistent style="width: 250px">
                    <ConfirmPopup :confirm-data="3" :channel-name=props.channelName>{{ deleteChannelPopup }}
                    </ConfirmPopup>
                  </q-dialog>
                </q-input>
              </q-form>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import MemberDetails from 'src/components/channel/MemberDetails.vue';
import RequestsDetails from 'src/components/channel/RequestsDetails.vue';

import ShowDialog from 'src/components/ShowDialog.vue';
import ConfirmPopup from 'src/components/ConfirmPopup.vue';
import InsertPopup from 'src/components/InsertPopup.vue';
import { reactive, ref } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useUserStore } from 'src/stores/user';
import { useChannelStore } from 'src/stores/channels';

const props = defineProps({
  editors: {
    type: Array,
    required: true
  },
  members: {
    type: Array,
    required: true
  },
  member_requests: {
    type: Array,
    required: true
  },
  editor_requests: {
    type: Array,
    required: true
  },
  channelName: {
    type: String,
    required: true
  },
  isPublicChannel: {
    type: Boolean,
    required: true
  }
})
const authStore = useAuthStore()
const userStore = useUserStore()
const channelStore = useChannelStore()

const confirm = ref(false)
const confirmDeleteChannel = ref('')
const confirmDeleteChannelRes = ref(false)
const confirmDeleteChannelPost = ref('')
const confirmDeleteChannelPostRes = ref(false)
const deleteChannelPopup = "Are you sure you want to delete this channel?"
const deleteChannelPostsPopup = "Are you sure you want to delete channel's all post?"
const channelData = reactive({
  "name": "",
  "description": "",
  "isPrivate": false,
})

const username = ""
const user_description = ""
const settingsTab = ref('see-members')
const prompt = ref(false)
const resetPassword = ref(false)
const deleteAccountProps = ref(false)
const confirmDelete = ref(false)

function filteredData(formData) {
  return Object.entries(formData)
    .reduce((acc, [key, value]) => {
      if (value !== '') {
        if (key === 'isPrivate' && value == props.isPublicChannel)
          acc[key] = value;
        if (key != 'isPrivate')
          acc[key] = value;
      }
      return acc;
    }, {})
}

async function submitChanneldata() {
  const channelData_json = JSON.parse(JSON.stringify(channelData))
  const submit_channelData = filteredData(channelData_json)
  const res = await channelStore.modifyChannel(props.channelName, submit_channelData)
}
const deleteChannel = (() => {
  if (confirmDeleteChannel.value === props.channelName) {
    confirmDeleteChannelRes.value = true
    console.log("channel delete")
  }
  else {
    alert("please iinsert again! They're different!")
  }
})
const deleteChannelPost = (() => {
  if (confirmDeleteChannelPost.value === props.channelName) {
    confirmDeleteChannelPostRes.value = true
    console.log("channel delete post!")
  }
  else {
    alert("please iinsert again! They're different!")
  }
})
</script>

<!-- <script>
import MemberDetails from 'src/components/channel/MemberDetails.vue';
import RequestsDetails from 'src/components/channel/RequestsDetails.vue';

import ShowDialog from 'src/components/ShowDialog.vue';
import ConfirmPopup from 'src/components/ConfirmPopup.vue';
import InsertPopup from 'src/components/InsertPopup.vue';
import { reactive, ref } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useUserStore } from 'src/stores/user';

export default {
  name: 'SettingsPage',
  props:{
    editors: {
      type: Array,
      required: true
    },
    members:{
      type: Array,
      required: true
    },
    member_requests:{
      type: Array,
      required: true
    },
    editor_requests:{
      type: Array,
      required: true
    },
    channelName:{
      type: String,
      required:true
    },
    isPublicChannel:{
      type:Boolean,
      required:true
    }
  },
  components:{
    MemberDetails,
    RequestsDetails,
    // ConfirmPopup,
  },
  data() {
    return {
      authStore: useAuthStore(),
      userStore: useUserStore(),
      confirm: ref(false),
      autoRenew: ref(false),
      confirmDeleteChannel:ref(''),
      channelData: reactive({
        "name":"",
        "description":"",
        "isPrivate":false,
      }),
      resetPopup: "Are you sure you want to reset the password?!",
      deletePopup: "Are you sure you want to delete the account?!",
      username: "",
      user_description: "",
      settingsTab: 'see-members',
      prompt: ref(false),
      telephone: ref(''),
      resetPassword: ref(false),
      deleteAccountProps: ref(false),
      confirmDelete: ref(false),
    }
  },
  methods: {
    //TODO: 还要检查 isPublic 是否修改了，反正只有三个内容就挨个检查吧
    filteredData(formData) {
      return Object.entries(formData)
      .reduce((acc, [key, value]) => {
        if (value !== '') {
          if(key==='isPrivate' && value!=props.isPublicChannel)
          acc[key] = value;
        }
        return acc;
      }, {})
    },
    submitChanneldata() {
      const userData_json = JSON.parse(JSON.stringify(this.channelData))
      const submit_channelData =  this.filteredData(channelData_json)
      console.log("在修改频道之前提交的数据为：", submit_channelData)
      // this.userStore.modifyUser(submit_channelData)

    },
    deleteChannel(){
      if (this.confirmDeleteChannel===this.$props.channelName){
      console.log("channel delete")
      }
    },
    deleteChannelPost(){

    }
  }
}
</script>
 -->
