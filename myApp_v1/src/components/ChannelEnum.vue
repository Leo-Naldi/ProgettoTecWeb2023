<template>
  <div>
    <q-item v-for="channel in channels" :key="channel.id" class="q-mb-sm" clickable v-ripple>
      <q-item-section avatar>
        <q-avatar rounded>
          <!-- <img :src="`https://cdn.quasar.dev/img/${contact.avatar}`"> -->
          <img src="https://cdn.quasar.dev/img/avatar2.jpg" />
          <!-- {{ user.handle[0] }} -->
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ channel.name }}</q-item-label>
        <q-item-label caption lines="1">{{ channel.description }}</q-item-label>
      </q-item-section>
      <ChannelButton></ChannelButton>
    </q-item>
  </div>
</template>

<script>
import ChannelButton from './ChannelButton.vue';

export default {
  name: "UserEnum",
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
    return {};
  },
};
</script>
