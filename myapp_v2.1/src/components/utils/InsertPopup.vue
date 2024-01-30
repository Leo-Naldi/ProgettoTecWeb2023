<template>
  <q-card style="min-width: 350px">
    <q-card-section>
      <div class="text-h6">
        <slot></slot>
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <q-input dense v-model="toModify" autofocus @keyup.enter="prompt = false" />
    </q-card-section>

    <q-card-actions align="right" class="text-primary">
      <q-btn flat label="Cancel" v-close-popup />
      <q-form @submit="handleInsert()" >

        <!-- <q-btn flat v-if="insertData === 2" label="Modify telephone" type="submit" v-close-popup /> -->
        <q-btn flat v-if="insertData === 1" label="Modify email" type="submit" v-close-popup />
        <q-btn flat v-if="insertData === 2" label="Verify Account" :type="toModify == localMail ? 'submit' : ''"
          :v-close-popup="toModify == localMail ? 'true' : 'false'" @click="confirmChangeMail = true">
          <q-dialog v-model="confirmChangeMail" persistent v-if="insertData === 3 && toModify != localMail">
            <q-card>
              <q-card-section class="row items-center">
                <span class="q-ml-sm center">Are you sure you want to use this mail? <br /> This mail is different from
                  the mail you registered! <br /> Click confirm if you want to <b>overwrite</b> your registered
                  mail!</span>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn flat label="Cancel" color="primary" v-close-popup />
                <!-- <q-btn flat label="Confirm" color="primary" @click="consentChangeMail = true" v-close-popup /> -->
                <q-btn flat label="Confirm" color="primary" @click="modifyMail()" v-close-popup />

              </q-card-actions>
            </q-card>
          </q-dialog>
        </q-btn>
      </q-form>
    </q-card-actions>
  </q-card>

  <!-- </q-dialog> -->
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
    // async modifyMail(){
    //   console.log("[InsertPopup] 输入的邮箱格式应该不正确：", this.email(this.toModify). this.toModify)
    //   if (this.email(this.toModify)==true){
    //     var submitForm = { email: this.toModify }
    //     await modifyEmail(submitForm)
    //   }
    //   else{
    //     showNegative("email format not correct! Please check and insert again!")
    //   }
    // },
    async verifyMailHandler() {
      // TODO: 确定输入的邮箱符合邮箱的格式
/*       if (this.toModify != this.localMail && this.consentChangeMail) {
        console.log("not true but consent modify")
        await this.modifyMail()
      }
      else  */
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
      // 如果邮箱相同就只是发送生成验证网址的邮件，否则就先发送修改邮箱的 API 然后发送生成验证网址的邮件
      console.log("verify mail to send is: ", this.toModify, this.localMail, localHandle, localToken)
    },
    async handleInsert() {
      console.log("props data is:", this.$props.insertData)
      switch (this.$props.insertData) {
        case 1:
          // TODO: 确定输入的邮箱符合邮箱的格式
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
