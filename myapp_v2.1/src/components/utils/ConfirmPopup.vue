<template>

  <q-card>
    <q-card-section class="row items-center">
      <q-avatar icon="heart_broken" color="primary" text-color="white" />
      <span class="q-ml-sm"><slot></slot>
        <!-- <ModifyPassword v-if="modifyPassword === true" /> -->
        <!-- <ChoosePlan v-if="choosePlan == true" /> -->
        </span>
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

import { useUserStore } from 'src/stores/user';
import { useChannelStore } from 'src/stores/channel';
import { useAccountStore } from 'src/stores/account';
import { useRouter } from 'vue-router';

export default {
props: {
  confirmData: {
    type: Number,
    default: -1
  },
  channelName:{
    type: String,
    default: ""
  },
},
setup(){
  return{
    router: useRouter()
  }
},
methods: {
  async handleConfirm() {
    // console.log("props data is:" , this.$props.confirmData)
    switch(this.$props.confirmData){
      case 1:
        const user_handle = useUserStore().getUserHandle;
        const res = await useAccountStore().resetPassword(user_handle, {password: "111111"})
        // console.log("【confirm popup】: resetPassword! handle is:", user_handle)
        if(res===200){
          this.router.push("/login");
        }
        break;
      case 2:
        await useAccountStore().deleteAccount()
        // console.log("【confirm popup】: delete!")
        break;
      case 3:
        // useChannelStore().deleteChannel(this.$props.channelName)
        if (this.$props.channelName){
          await useChannelStore().deleteChannel(this.$props.channelName)
        }
        else{
          console.log("【confirmPopup】：channelDetails get from inject failed!")
        }
        // console.log("【confirm popup】: delete channel!")
        break;
      case 4:
        const data = await this.userStore.cancelPlan()
        // console.log("【confirm popup】: confirm popup: cancel plan! res is: ", data)
        break;
      default:
        console.log("【ConfirmPopup】no submit")
    }
  }
}
}
</script>
