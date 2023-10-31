<template>
  <div class="q-px-md">
    <q-card flat square>
      <q-card-section class="q-pa-none q-py-md row">
        <!-- <div class="col-sm-6 col-xs-12 q-pb-sm"> -->
        <div>
          <q-tabs v-model="settingsTab" align="left" active-color="primary" active-bg-color="blue-1" class="text-grey-10"
            vertical>
            <q-tab name="see-members" label="members" style="justify-content: left" content-class="q-pl-md" />
            <q-tab name="see-requests" label="requests" style="justify-content: left" content-class="q-pl-md" />

            <q-tab name="channelSettings" label="channel settings" style="justify-content: left" content-class="q-pl-md" />

            <q-tab name="deleteChannel" label="Delete Channel" style="justify-content: left" content-class="q-pl-md" />
          </q-tabs>
        </div>
        <q-separator :vertical="$q.screen.gt.xs" v-show="$q.screen.gt.xs" />
        <div class="col-sm col-xs-12 q-px-md q-pt-none">
          <q-tab-panels v-model="settingsTab" animated transition-prev="fade" transition-next="fade" >
            <q-tab-panel name="see-members" class=" q-pt-none">
              <MemberDetails  :users=users />
            </q-tab-panel>
            <q-tab-panel name="see-requests" class="q-pt-sm">
              <RequestsDetails :member_requests=member_requests />
            </q-tab-panel>
            <q-tab-panel name="channelSettings" class="q-pt-sm">
              <div class="text-h5 col-12 q-mb-md" style="cursor: help">Channel Settings<q-tooltip
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
                <q-form @submit="submitUserdata()" class="q-gutter-md">
                    <q-input class="col" outlined dense square label="name" v-model="channelData.name" />

                  <q-input type="textarea" outlined dense square label="personal descriptions"
                    v-model="channelData.description" />
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
                  <q-input class="col" outlined dense square label="name" v-model="confirmDeleteChannel" />
              </q-form>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import MemberDetails from 'src/components/MemberDetails.vue';
import RequestsDetails from 'src/components/RequestsDetails.vue';

import ShowDialog from 'src/components/ShowDialog.vue';
import ConfirmPopup from 'src/components/ConfirmPopup.vue';
import InsertPopup from 'src/components/InsertPopup.vue';
import { reactive, ref } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useUserStore } from 'src/stores/user';

export default {
  name: 'SettingsPage',
  props:{
    users: {
      type: Array,
      required: true
    },
    member_requests:{
      type: Array,
      required: true
    },
    channelName:{
      type: String,
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
        "description":""
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
      insertHeader: "Modify your email!",
      modifyTelephone: ref(false),
      modifyEmail: ref(false),
      confirmDelete: ref(false),
      userData: reactive({
        username: "",
        gender: "",
        name: "",
        lastname: "",
        description: ""
      })
    }
  },
  methods: {
    filteredData(formData) {
      return Object.entries(formData)
      .reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {})
    },
    submitUserdata() {
      const userData_json = JSON.parse(JSON.stringify(this.userData))
      const submit_userData =  this.filteredData(userData_json)
      this.userStore.modifyUser(submit_userData)

    },
    deleteChannel(){
      if (this.confirmDeleteChannel===this.$props.channelName){
      console.log("channel delete")
      }
    }
  }
}
</script>
