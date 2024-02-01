<template>
  <div role="region" aria-label="Your Channels" class="flex justify-end items-end">
    <!-- Create Channel Button -->
    <div style="align-self: right;">
      <q-btn flat round size="md" icon="group_add" @click="createChannel" role="button" aria-haspopup="true"
        aria-expanded="false">
        <q-popup-proxy>
          <CloseDialog>
            <!-- Create Channel Form -->
            <div class="col-md-4 col-sm-5 col-xs-12 q-gutter-y-md q-pt-md q-pl-md q-pb-md" role="form">
              <p class="text-weight-bold text-h6 tex-center">
                Created Channel
              </p>
              <MyForm @submit="createChannel" class="q-gutter-md" role="form" aria-labelledby="createChannel-form-label">
                  <div id="createChannel-form-label" class="visually-hidden">ForgetPassword Form</div>
                <MyInput class="col" outlined dense square label="name" :rules="[val => !!val || 'Name is required']"
                  v-model="channelData.name" aria-label="channel name" />
                <MyInput type="textarea" outlined dense square label="personal descriptions"
                  v-model="channelData.description" aria-label="channel description" />
                <div>
                  <q-checkbox v-model="channelData.publicChannel" label="Set Public" role="checkbox"
                    aria-checked="true" />
                </div>
                <div>
                  <q-checkbox v-model="channelData.official" label="Set Official" role="checkbox" aria-checked="false" />
                </div>
                <q-btn label="create channel" aria-label="create channel" type="submit" color="primary" unelevated role="button" />
              </MyForm>
            </div>
          </CloseDialog>
        </q-popup-proxy>
      </q-btn>
    </div>
  </div>

  <!-- Your Created Channels -->
  <p class="q-mt-none text-weight-bold text-h5 q-pl-lg q-pt-lg" role="heading">
    Your Created Channels
  </p>
  <div class="q-pa-md" role="region" aria-label="Created Channels">
    <q-list style="max-width: 450px;">
      <ChannelEnum :channels="userChannels.userCreated" clickable role="list" />
    </q-list>
  </div>

  <q-separator color="grey-2" size="3px" role="separator" />

  <!-- Your Joined Channels -->
  <p class="q-mt-none text-weight-bold text-h5 q-pl-lg q-pt-lg" role="heading">
    Your Joined Channels
  </p>
  <div class="q-pa-md" role="region" aria-label="Joined Channels">
    <q-list style="max-width: 450px;">
      <ChannelEnum :channels="userChannels.userJoined" clickable role="list" />
    </q-list>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive } from "vue";
import CloseDialog from "src/components/utils/CloseDialog.vue";
import ChannelEnum from "src/components/channel/ChannelEnum.vue";

import { useUserStore } from "src/stores/user";
import { useChannelStore } from "src/stores/channel";
import MyForm from "src/components/common/MyForm.vue";


const channelStore = useChannelStore()
const user_json = useUserStore().getUserJson
const userChannels = reactive({
  userCreated: user_json.createdChannels,
  userJoined: user_json.joinedChannels
})



const channelData = reactive({
  "name": "",
  "description": "",
  "publicChannel": true,
  "official": false
})

function filteredData(formData) {
  return Object.entries(formData)
    .reduce((acc, [key, value]) => {
      if (value !== '') {
        if (key === 'publicChannel' && value != true)
          acc[key] = value;
        else if (key === 'official' && value != false) {
          if (user_json.admin) {
            acc[key] = value;
          }
        }
        if (key != 'publicChannel' && key != 'official')
          acc[key] = value;
      }
      return acc;
    }, {})
}

const createChannel = async () => {
  if (channelData.name != "") {
    const channelData_json = JSON.parse(JSON.stringify(channelData))
    const submit_channelData = filteredData(channelData_json)
    // console.log("ready to create channel: ", submit_channelData)
    const res = await channelStore.createChannel(channelData.name, submit_channelData)
    if (res.length > 1) {
      userChannels.userCreated.unshift(res[1])
    }
  }
}


</script>
