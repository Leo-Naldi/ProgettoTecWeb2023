<template>
  <div>
    <q-item v-for="channel in channels" :key="channel.id" class="q-mb-sm" clickable v-ripple @click="goToDetails(channel.name)" role="button" aria-label="Go to Channel Details">
      <q-item-section avatar aria-label="avatar">
        <q-avatar color="primary" text-color="white">
          {{ channel.name[0]+channel.name[1] }}
          </q-avatar>
        <!-- <img :src="`https://cdn.quasar.dev/img/${contact.avatar}`"> -->
        <!-- <img src="https://cdn.quasar.dev/img/avatar2.jpg" alt="channel avatar" /> -->

      </q-item-section>

      <q-item-section>
        <q-item-label>{{ channel.name }}</q-item-label>
        <q-item-label caption lines="1">{{ channel.description }}</q-item-label>
      </q-item-section>
      <ChannelButton :channel_name="channel.name" :channel="channel" v-if="getUserMy"/>
    </q-item>
  </div>
</template>

<script>
import ChannelButton from './ChannelButton.vue';
import { useRouter } from 'vue-router';
import { getUser } from "src/common/localStorageHandler";

export default {
  name: "ChannelEnum",
  components:{
    ChannelButton
  },
  props: {
    channels: {
      type: Array,
      required: true,
    },
  },
  setup() {
    const router=useRouter()
    const getUserMy = getUser()

    const goToDetails = ((name) => {
      router.push({
        name: "ChannelDetail",
        params: {
          channelName: name,
        },
      });
    })
    return {
      router,
      goToDetails,
      getUserMy
    };
  },
};
</script>
