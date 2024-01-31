<template>
  <div class="q-px-md">
    <q-card flat square>
      <q-card-section class="q-pa-none q-py-md row">
        <div>
          <q-tabs v-model="settingsTab" align="left" active-color="primary" active-bg-color="blue-1" class="text-grey-10"
            vertical>
            <q-tab name="basicSettings" label="Account settings" style="justify-content: left" content-class="q-pl-md" />
            <q-tab name="planSettings" label="premium" style="justify-content: left" content-class="q-pl-md" />

            <q-tab name="safeSettings" label="safe settings" style="justify-content: left" content-class="q-pl-md" />
            <q-tab name="privacySettings" label="privacy settings" style="justify-content: left"
              content-class="q-pl-md" />

            <q-tab name="authSettings" label="Account safety" style="justify-content: left" content-class="q-pl-md" />

            <q-tab name="deleteAccount" label="Delete Account" style="justify-content: left" content-class="q-pl-md" />
          </q-tabs>
        </div>
        <q-separator :vertical="$q.screen.gt.xs" v-show="$q.screen.gt.xs" />
        <div class="col-sm col-xs-12 q-px-md q-pt-none">
          <q-tab-panels v-model="settingsTab" animated transition-prev="fade" transition-next="fade">
            <q-tab-panel name="basicSettings" class="row q-pt-sm">
              <div class="text-h5 col-12 q-mb-md" style="cursor: help">Account Settings<q-tooltip
                  class="bg-grey text-body2" :offset="[10, 10]">
                  If you do not want to change one of them, please leave them empty
                </q-tooltip></div>
              <div class="col-xs-12 q-mb-md">
                <span class="text-center block">
                  <q-img src="../../assets/head.png" width="180px" :ratio="10 / 10" />
                </span>
                <span class="text-center block">
                  <q-btn unelevated color="primary" label="change avatar" icon="unarchive" />
                </span>
              </div>
              <!-- <div class="col-md-4 col-sm-5 col-xs-12 q-gutter-y-md q-pt-md q-pl-md q-pb-md"> -->
              <div class="col-xs-12 q-gutter-y-md q-pt-md q-pl-md q-pb-md">
                <q-form @submit="submitUserdata()" class="q-gutter-md">
                  <span class="row q-gutter-x-sm">
                    <q-input class="col" outlined dense square label="nickname" v-model="userData.username" />
                    <q-select class="col" outlined dense square behavior="menu" label="gender" options-dense
                      :options="['♂️', '♀️', '⚧']" v-model="userData.gender" />
                  </span>
                  <span class="row q-gutter-x-sm">
                    <q-input class="col" outlined dense square label="firstname" v-model="userData.name" />
                    <q-input class="col" outlined dense square label="lastname" v-model="userData.lastname" />
                  </span>
                  <q-input type="textarea" outlined dense square label="personal descriptions"
                    v-model="userData.description" />
                  <q-btn label="update data" type="submit" color="primary" unelevated />
                </q-form>
              </div>
              <!-- <div class="gt-xs col-md-8 col-sm-7">
                <span class="text-center block">
                  <q-img src="../assets/head.png" width="180px" :ratio="10 / 10" />
                </span>
                <span class="text-center block">
                  <q-btn unelevated color="primary" label="change avatar" icon="unarchive" />
                </span>
              </div> -->
            </q-tab-panel>
            <q-tab-panel name="planSettings" class="q-pt-sm">
              <div class="text-h5 col-12 q-mb-md">Plan Settings</div>
              <q-list class="text-body2">
                <q-item>
                  <q-item-section>
                    <q-item-label>Pay plan</q-item-label>
                    <q-item-label class="text-grey-6">become our member!
                    </q-item-label>
                  </q-item-section>
                  <q-item-section avatar>
                    <q-btn flat unelevated color="primary" label="Modify">
                      <q-popup-proxy>
                        <div class="flex flex-center" style="width: 400px;position:absolute;">
                          <CloseDialog :choosePlan="true" />
                        </div>
                      </q-popup-proxy>

                    </q-btn>
                  </q-item-section>
                </q-item>

                <q-separator inset="" spaced="10px" />
                <q-item v-if="storedUser.subscription">
                  <q-item-section>
                    <q-item-label>Cancel plan</q-item-label>
                    <q-item-label class="text-grey-6">delete your plan
                    </q-item-label>
                  </q-item-section>
                  <q-item-section avatar>
                    <q-btn flat unelevated color="primary" label="Cancel" @click="cancelPlan = true">
                      <q-dialog v-model="cancelPlan" persistent>

                        <ConfirmPopup :confirm-data="5">
                            {{ cancelPlanPopup }}
                        </ConfirmPopup>
                      </q-dialog>
                    </q-btn>
                  </q-item-section>
                </q-item>
                <q-separator v-if="storedUser.subscription" inset="" spaced="10px" />
              </q-list>
            </q-tab-panel>
            <q-tab-panel name="safeSettings" class="q-pt-sm">
              <div class="text-h5 col-12 q-mb-md">Security Settings</div>
              <q-list class="text-body2">
                <q-item>
                  <q-item-section>
                    <q-item-label>Modify password</q-item-label>
                    <q-item-label class="text-grey-6">current password strengh: strong
                    </q-item-label>
                  </q-item-section>
                  <q-item-section avatar>
                    <q-btn flat unelevated color="primary" label="Modify">
                      <q-popup-proxy>
                        <div class="flex flex-center" style="width: 400px;position:absolute;">
                          <CloseDialog :modifyPassword="true" />
                        </div>
                      </q-popup-proxy>

                    </q-btn>
                  </q-item-section>
                </q-item>
                <q-separator inset="" spaced="10px" />
                <q-item>
                  <q-item-section>
                    <q-item-label>Reset password</q-item-label>
                    <q-item-label class="text-grey-6">current password strengh: strong
                    </q-item-label>
                  </q-item-section>
                  <q-item-section avatar>
                    <q-btn flat unelevated color="primary" label="Reset" @click="resetPassword = true">
                      <q-dialog v-model="resetPassword" persistent>

                        <ConfirmPopup :confirm-data="1">{{ resetPopup }}</ConfirmPopup>
                      </q-dialog>

                    </q-btn>
                  </q-item-section>
                </q-item>
                <q-separator inset="" spaced="10px" />
                <q-item>
                  <q-item-section>
                    <q-item-label>email</q-item-label>
                    <q-item-label class="text-grey-6">
                      change bined email
                    </q-item-label>
                  </q-item-section>
                  <q-item-section avatar>
                    <q-btn flat unelevated color="primary" label="Modify" @click="modifyEmail = true">
                      <q-popup-proxy>
                        <div class="flex flex-center" style="width: 500px;position:absolute;">
                          <q-dialog v-model="modifyEmail" persistent>
                            <InsertPopup :insertData="1">{{ insertHeader }}</InsertPopup>
                          </q-dialog>
                        </div>
                      </q-popup-proxy>
                    </q-btn>
                  </q-item-section>
                </q-item>
                <q-separator inset="" spaced="10px" />
                <!--                 <q-item>
                  <q-item-section>
                    TODO: add telephone (to send OTPW when login)
                    <q-item-label>telephone</q-item-label>
                    <q-item-label class="text-grey-6">
                      telephone binded：{{ accountSettingsData.safeData.phone }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section avatar>
                    <q-btn flat unelevated color="primary" label="Modify" @click="modifyTelephone = true">
                      <q-popup-proxy>
                        <div class="flex flex-center" style="width: 400px;position:absolute;">
                          <q-dialog v-model="modifyTelephone" persistent>
                            <InsertPopup></InsertPopup>
                          </q-dialog>
                        </div>
                      </q-popup-proxy>
                    </q-btn>
                  </q-item-section>
                </q-item>
                <q-separator inset="" spaced="10px" /> -->
                <q-item>
                  <q-item-section>
                    <q-item-label>verify</q-item-label>
                    <q-item-label class="text-grey-6">
                      verify your account with your mail
                    </q-item-label>
                  </q-item-section>
                  <q-item-section avatar>
                    <q-btn flat unelevated color="primary" label="Verify" @click="verifyAccount = true">
                      <q-popup-proxy>
                        <div class="flex flex-center" style="width: 400px;position:absolute;">
                          <q-dialog v-model="verifyAccount" persistent>
                            <InsertPopup :insertData="2">{{ verifyHeader }}</InsertPopup>
                          </q-dialog>
                        </div>
                      </q-popup-proxy>
                    </q-btn>
                  </q-item-section>
                </q-item>
                <q-separator inset="" spaced="10px" />
              </q-list>
            </q-tab-panel>
            <q-tab-panel name="privacySettings" class="q-pt-sm">
              <div class="text-h5 col-12 q-mb-md">Login Logs</div>
              <q-list class="text-body2">
                <q-item>
                  <q-item-section>
                    <q-item-label clickable class="cursor-pointer">See hided posts
                      <q-popup-proxy>
                        <div class="flex flex-center" style="width: 400px;position:absolute;">
                          <CloseDialog>
                            <q-list separator v-if="hided_posts.length>0">
                              <ShowPost v-for="post in hided_posts" :key="post.id" v-bind="post" clickable />
                            </q-list>
                            <p v-else>No hided posts!</p>
                          </CloseDialog>
                        </div>
                      </q-popup-proxy>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-tab-panel>
            <q-tab-panel name="authSettings" class="q-pt-sm">
              <div class="text-h5 col-12 q-mb-md">Login Logs</div>
              <q-list class="text-body2">
                <q-item>
                  <q-item-section>
                    <q-item-label>Last login Time</q-item-label>
                    <q-item-label class="text-grey-6">{{ userJson.lastLoggedin }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <!--                 <q-separator inset="" spaced="10px" />
                <q-item>
                  <q-item-section>
                    TODO: get logged in device
                    <q-item-label>Last login device</q-item-label>
                    <q-item-label class="text-grey-6">current password strengh: strong
                    </q-item-label>
                  </q-item-section>
                  <q-item-section avatar>
                    <q-btn flat unelevated color="primary" label="Modify" @click="resetPassword = true">
                      <q-dialog v-model="resetPassword" persistent>
                        <ConfirmPopup :confirm-data="1">{{ resetPopup }}</ConfirmPopup>
                      </q-dialog>
                    </q-btn>
                  </q-item-section>
                </q-item>
                <q-separator inset="" spaced="10px" /> -->
              </q-list>
            </q-tab-panel>
            <q-tab-panel name="deleteAccount" class="q-pt-sm">
              <div class="text-h5 col-12 q-mb-md">Delete your account</div>
              <div style="margin-top: 2rem; margin-left:2rem">
                <q-btn label="Delete" color="primary" size="md" @click="confirmDelete = true">
                  <q-dialog v-model="confirmDelete" persistent style="width: 250px">
                    <ConfirmPopup :confirm-data="2">{{ deletePopup }}</ConfirmPopup>
                  </q-dialog>
                </q-btn>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import CloseDialog from '../../components/utils/CloseDialog.vue';
import ConfirmPopup from '../../components/utils/ConfirmPopup.vue';
import InsertPopup from '../../components/utils/InsertPopup.vue';
import ShowPost from '../../components/posts/ShowPost.vue';

import { reactive, ref, computed } from 'vue';


import { useUserStore } from 'src/stores/user';
import { usePostStore } from 'src/stores/post';

import { writeUser } from 'src/common/requestsHandler';


export default {
  name: 'SettingsPage',
  setup() {
    const userStore = useUserStore()
    const postStore = usePostStore()
    const storedUser = computed(() => userStore.getUserJson)
    const isMember = JSON.parse(JSON.stringify(storedUser.value)).subscription
    const hided_posts = computed(() => postStore.getHideList)
    const userJson = useUserStore().getUserJson

    return {
      userStore,
      storedUser,
      isMember,
      hided_posts,
      userJson
    }
  },
  data() {
    return {
      // userStore: useUserStore(),
      confirm: ref(false),
      autoRenew: ref(false),
      resetPopup: "Are you sure you want to reset the password?!",
      deletePopup: "Are you sure you want to delete the account?!",
      cancelPlanPopup: "Are you sure you want to cancel your plan?!",
      username: "",
      user_description: "",
      settingsTab: 'basicSettings',
      prompt: ref(false),
      telephone: ref(''),
      resetPassword: ref(false),
      cancelPlan: ref(false),
      deleteAccountProps: ref(false),
      insertHeader: "Modify your email!",
      verifyHeader: "Insert your mail to send verification url!",
      modifyTelephone: ref(false),
      modifyEmail: ref(false),
      verifyAccount: ref(false),
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
  components: {
    CloseDialog,
    ConfirmPopup,
    InsertPopup,
    ShowPost,
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
      const submit_userData = this.filteredData(userData_json)
      writeUser(submit_userData)
    }
  }
}
</script>




<!--
TODO: plan and payments
{
  "_id": "653fd35bd927a60b9404b633",
  "name": "Monthly subscription plan",
  "price": 4.99,
  "period": "month",
  "extraCharacters": {
      "day": 300,
      "week": 2240,
      "month": 10230
  },
  "pro": true,
  "id": "653fd35bd927a60b9404b633"
},
{
  "_id": "653fd35bd927a60b9404b634",
  "name": "Yearly subscription plan",
  "price": 49.99,
  "period": "year",
  "extraCharacters": {
      "day": 300,
      "week": 2240,
      "month": 10230
  },
  "pro": true,
  "id": "653fd35bd927a60b9404b634"
}
-->

<style scoped>
/* set background color */
.demo {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* background-image: linear-gradient(-225deg, #e3fdf5 0%, #ffe6fa 100%); */
}

/* set login form style*/
.form-bg {
  border-radius: 10px;
  padding: 20px;
}

.form-card {
  width: 400px;
}
</style>

