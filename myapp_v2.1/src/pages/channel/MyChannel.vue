<template>
  <!--   <div class="row items-center">
    <div class="col-12 col-md-7">
      <p class="q-mt-none text-weight-bold text-h6 q-pl-lg q-pt-lg"> see your channels! </p>
    </div>
    <div class="col-12 col-md-4">
      <q-btn flat icon="search" @click="gotoPage" />
      <div>Do you want to create one?</div>
    </div>
    <div class="col-12 col-md-1">
      <q-btn flat icon="add" @click="gotoPage" />
    </div>
  </div> -->
  <!-- <q-btn flat icon="add" @click="createChannel()" /> -->

  <div style="display: flex;
  justify-content: right;
  align-items: flex-end;">
    <div style="align-self: right;">
      <q-btn flat round size="md" icon="group_add" @click="createChannel()">
        <q-popup-proxy>
          <CloseDialog>
            <div class="col-md-4 col-sm-5 col-xs-12 q-gutter-y-md q-pt-md q-pl-md q-pb-md">
              <p class=" text-weight-bold text-h6 " align="center">
                Created Channel</p>
              <q-form @submit="createChannel()" class="q-gutter-md">
                <q-input class="col" outlined dense square label="name" :rules="[val => !!val || 'Name is required']" v-model="channelData.name" />

                <q-input type="textarea" outlined dense square label="personal descriptions"
                  v-model="channelData.description" />

                <div>
                  <!-- q-checkbox has default value as -->
                  <q-checkbox v-model="channelData.publicChannel" label="Set Public" /></div>
                <div><q-checkbox v-model="channelData.official" label="Set Official" /></div>


                <q-btn label="create channel" type="submit" color="primary" unelevated />
              </q-form>
            </div>
          </CloseDialog>
        </q-popup-proxy>
      </q-btn>
    </div>
  </div>

  <!-- <div style="display: flex;
  justify-content: space-between;
  align-items: flex-end;">
    <div style="order:1">
      <p class="q-mt-none text-weight-bold text-h6 q-pl-lg q-pt-lg"> see your channels! </p>
    </div>
    <div style="align-self: center; order:2">
      <p>Do you want to create one?</p>
    </div>
    <div style="align-self: center; order:2">
      <q-btn flat icon="add" @click="createChannel()" />

    </div>
  </div> -->


  <!-- <q-separator color="grey-2" size="4px" /> -->

  <p class="q-mt-none text-weight-bold text-h5 q-pl-lg q-pt-lg">
    Your Created Channels
  </p>
  <div class="q-pa-md">
    <q-list style="max-width: 450px;">
      <ChannelEnum :channels="userChannels.userCreated" clickable />
    </q-list>
  </div>

  <q-separator color="grey-2" size="3px" />

  <p class="q-mt-none text-weight-bold text-h5 q-pl-lg q-pt-lg">
    Your Joined Channels
  </p>
  <div class="q-pa-md">
    <q-list style="max-width: 450px;">
      <ChannelEnum :channels="userChannels.userJoined" clickable />
    </q-list>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive } from "vue";
import CloseDialog from "src/components/utils/CloseDialog.vue";
import ChannelEnum from "src/components/channel/ChannelEnum.vue";

import { useUserStore } from "src/stores/user";
import { useChannelStore } from "src/stores/channel";


// const userStore = useUserStore()
const channelStore = useChannelStore()
const user_json = useUserStore().getUserJson
const userChannels = reactive({
  userCreated: user_json.createdChannels,
  userJoined: user_json.joinedChannels
})

// console.log("获取用户 store 的数据：", tmp)
// console.log("获取用户 store: ", userChannels.userJoined)



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
        if (key === 'publicChannel' && value !=true)
          acc[key] = value;
        else if (key === 'official' && value !=false)
        {
          if (user_json.admin){
            acc[key] = value;
          }
        }
        if (key != 'publicChannel' && key!='official')
          acc[key] = value;
      }
      return acc;
    }, {})
}

const createChannel = async ()=>{
  if (channelData.name!=""){
  const channelData_json = JSON.parse(JSON.stringify(channelData))
  const submit_channelData = filteredData(channelData_json)
  // console.log("ready to create channel: ", submit_channelData)
  const res = await channelStore.createChannel(channelData.name, submit_channelData)
  // console.log("创建频道的返回值：",res)
  if(res.length>1){
    userChannels.userCreated.unshift(res[1])
  }
  }
}


</script>
