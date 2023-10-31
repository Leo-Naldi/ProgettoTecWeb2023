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
  <div style="display: flex;
  justify-content: space-between;
  align-items: flex-end;">
    <div style="order:1">
      <p class="q-mt-none text-weight-bold text-h6 q-pl-lg q-pt-lg"> see your channels! </p>
    </div>
    <!-- <div style="align-self: center; order:2">
      <p>Do you want to create one?</p>
    </div> -->
    <div style="align-self: center; order:2">
      <q-btn flat icon="add" @click="createChannel()" />

    </div>
  </div>


  <q-separator color="grey-2" size="4px" />

  <p class="q-mt-none text-weight-bold text-h5 q-pl-lg q-pt-lg">
    Your Created Channels
  </p>
  <div class="q-pa-md">
    <q-list style="max-width: 450px;">
      <ChannelEnum :channels="userChannels.userCreated" clickable></ChannelEnum>
    </q-list>
  </div>

  <q-separator color="grey-2" size="3px" />

  <p class="q-mt-none text-weight-bold text-h5 q-pl-lg q-pt-lg">
    Your Joined Channels
  </p>
  <div class="q-pa-md">
    <q-list style="max-width: 450px;">
      <ChannelEnum :channels="userChannels.userJoined" clickable></ChannelEnum>
    </q-list>
  </div>
</template>

<script setup>
import { useUserStore } from "src/stores/user";
import { onMounted, reactive } from "vue";
import ChannelEnum from "src/components/ChannelEnum.vue";

const userStore = useUserStore()
const userChannels = reactive({
  userCreated: [],
  userJoined: []
})

const fetchUserChannels = async () => {
  userChannels.userCreated = await userStore.fetchUserCreatedChannels()
  userChannels.userJoined = await userStore.fetchUserJoinedChannels()
};

function createChannel(){
  console.log("create channel")
}

onMounted(() => {
  fetchUserChannels()
})

</script>
