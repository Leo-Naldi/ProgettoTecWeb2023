<template>
  <q-card style="min-width: 350px">
  <q-card-section>
    <div class="text-h6"><slot></slot></div>
  </q-card-section>

  <q-card-section class="q-pt-none">
    <q-input dense v-model="toModify" autofocus @keyup.enter="prompt = false" />
  </q-card-section>

  <q-card-actions align="right" class="text-primary">
    <q-btn flat label="Cancel" v-close-popup />
    <q-form @submit="handleInsert()" class="q-gutter-md">

    <q-btn flat v-if="insertData===2" label="Modify telephone" type="submit" v-close-popup />
    <q-btn flat v-if="insertData===1" label="Modify email"  type="submit" v-close-popup />
    </q-form>
  </q-card-actions>
</q-card>

  <!-- </q-dialog> -->
</template>

<script>
import { ref } from 'vue';
import { useUserStore } from 'src/stores/user';

export default {
  // name: 'ComponentName',
  setup() {
    return {}
  },
  props: {
    insertData: {
      type: Number,
      default: -1
    },
  },
  data() {
    return {
      toModify: ref(''),
      userStore: useUserStore()
    }
  },
  methods: {
    handleInsert() {
      console.log("props data is:" , this.$props.insertData)
      switch(this.$props.insertData){
        case 1:
          // this.userStore.resetPassword()
          var submitForm = { email: this.toModify}
          this.userStore.modifyEmail(submitForm)
          break;
        case 2:
          // this.authStore.deleteAccount()
          console.log("modify email!")
          break;
        default:
          console.log("no submit")
      }
    }
  }
}
</script>
