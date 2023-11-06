<template>

    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="heart_broken" color="primary" text-color="white" />
        <span class="q-ml-sm"><slot></slot></span>
      </q-card-section>

      <q-card-actions align="right">
        <q-form @submit="handleConfirm()" class="q-gutter-md">

          <q-btn flat label="Cancel" color="primary" v-close-popup />

          <q-btn flat label="I'm sure" color="primary" type="submit" v-close-popup />
        </q-form>

      </q-card-actions>
    </q-card>

</template>

<script>
import { ref } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useUserStore } from 'src/stores/user';
import { useChannelStore } from 'src/stores/channels';

export default {
  // name: 'ComponentName',
  setup() {
    return {}
  },
  props: {
    confirmData: {
      type: Number,
      default: -1
    },
    channelName:{
      type: String
    }
  },
  data() {
    return {
      authStore: useAuthStore(),
      userStore: useUserStore(),
      channelStore: useChannelStore()
    }
  },
  methods: {
    handleConfirm() {
      console.log("props data is:" , this.$props.confirmData)
      switch(this.$props.confirmData){
        case 1:
          const user_handle = this.userStore.getUserHandle();
          this.userStore.resetPassword(user_handle, "111111")
          console.log("reset!")
          break;
        case 2:
          this.authStore.deleteAccount()
          console.log("delete!")
          break;
        case 3:
          this.channelStore.deleteChannel(this.$props.channelName)
          console.log("delete channel!")
          break;
        case 4:
          const res = this.channelStore.deleteChannelMessages(this.$props.channelName)
          console.log("delete channel messages returned with res: "+res)
          break;
        default:
          console.log("no submit")
      }
    }
  }
}
</script>
