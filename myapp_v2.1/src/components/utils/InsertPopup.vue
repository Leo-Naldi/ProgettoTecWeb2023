<template>
  <q-card style="min-width: 350px" role="dialog" aria-labelledby="dialogTitle" aria-describedby="dialogContent" >
    <q-card-section>
      <div class="text-h6" id="insertPopupTitle">
        <slot></slot>
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <q-input dense v-model="toModify" autofocus @keyup.enter="prompt = false" aria-label="Input Field for Modification" />
    </q-card-section>

    <q-card-actions align="right" class="text-primary">
      <q-btn flat label="Cancel" v-close-popup aria-label="Cancel Button" />
      <q-form @submit="handleInsert()" >

        <q-btn flat v-if="insertData === 1" label="Modify email" type="submit" v-close-popup aria-label="Submit Modification" />
        <q-btn flat v-if="insertData === 2" label="Verify Account" :type="toModify == localMail ? 'submit' : ''"
          :v-close-popup="toModify == localMail ? 'true' : 'false'" @click="confirmChangeMail = true" aria-label="Verify Account Button">
          <q-dialog v-model="confirmChangeMail" persistent v-if="insertData === 3 && toModify != localMail">
            <q-card>
              <q-card-section class="row items-center">
                <span class="q-ml-sm center">Are you sure you want to use this mail? <br /> This mail is different from
                  the mail you registered! <br /> Click confirm if you want to <b>overwrite</b> your registered
                  mail!</span>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn flat label="Cancel" color="primary" v-close-popup aria-label="Cancel Verification"  />
                <q-btn flat label="Confirm" color="primary" @click="modifyMail()" v-close-popup aria-label="Confirm Verification" />

              </q-card-actions>
            </q-card>
          </q-dialog>
        </q-btn>
      </q-form>
    </q-card-actions>
  </q-card>

</template>

<script>
import { ref, computed } from 'vue';
import { useUserStore } from 'src/stores/user';
import useValidation from 'src/common/validation'

import { modifyEmail, verifyAccount } from 'src/common/requestsHandler';
import { showNegative } from 'src/common/utils';

export default {
  name: 'InsertPopup',
  props: {
    insertData: {
      type: Number,
      default: -1
    },
  },
  data() {
    return {
      toModify: ref(''),
      confirmChangeMail: ref(false),
      consentChangeMail: ref(false),
      localMail: useUserStore().getUserJson.email
    }
  },
  setup(){
    const {  email } = useValidation();
    return {
      email,
    }
  },
  methods: {
    async verifyMailHandler() {
      var localHandle = useUserStore().getUserHandle
      var localToken = useUserStore().getUserToken
      if (this.email(this.toModify)!=true){
        showNegative("email format not exists! Please check and insert again!")
      }
      else if (this.toModify === this.localMail){
        await verifyAccount(this.toModify, localHandle, localToken)
      }
      else{
        showNegative("email not correct! Please check and insert again!")
      }
      console.log("verify mail to send is: ", this.toModify, this.localMail, localHandle, localToken)
    },
    async handleInsert() {
      console.log("props data is:", this.$props.insertData)
      switch (this.$props.insertData) {
        case 1:
          var submitForm = { email: this.toModify }
          await modifyEmail(submitForm)
          break;
        case 2:
          await this.verifyMailHandler()
          break;
        default:
          console.log("no submit")
      }
    }
  }
}
</script>
