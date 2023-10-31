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
  },
  data() {
    return {
      authStore: useAuthStore(),
      userStore: useUserStore()
    }
  },
  methods: {
    handleConfirm() {
      console.log("props data is:" , this.$props.confirmData)
      switch(this.$props.confirmData){
        case 1:
          this.userStore.resetPassword()
          console.log("reset!")
          break;
        case 2:
          this.authStore.deleteAccount()
          console.log("delete!")
          break;
        default:
          console.log("no submit")
      }
    }
  }
}
</script>
