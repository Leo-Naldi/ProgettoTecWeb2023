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
      <q-form @submit="handleInsert()" class="q-gutter-md">

        <q-btn flat v-if="insertData === 2" label="Modify telephone" type="submit" v-close-popup />
        <q-btn flat v-if="insertData === 1" label="Modify email" type="submit" v-close-popup />
        <q-btn flat v-if="insertData === 3" label="Verify Account" :type="toModify == registeredMail ? 'submit' : ''"
          :v-close-popup="toModify == registeredMail ? 'true' : 'false'" @click="confirmChangeMail = true">
          <q-dialog v-model="confirmChangeMail" persistent v-if="insertData === 3 && toModify != registeredMail">
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
import { useAuthStore } from 'src/stores/auth';
import { LocalStorage } from 'Quasar'


export default {
  // name: 'ComponentName',
  setup() {
    const userStore = useUserStore()
    const storedUser = computed(() => userStore.getUserJson)
    // const storedUserToken = computed(() => userStore.getUserToken)

    const authStore = useAuthStore()
    const storedUserToken = authStore.getToken()

    const registeredMail = JSON.parse((JSON.parse(JSON.stringify(LocalStorage.getItem('user'))))).email
    const storedUserHandle = computed(() => userStore.getUser)

    return {
      userStore,
      storedUserToken,
      storedUserHandle,
      registeredMail
    }
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
      confirmChangeMail: ref(false),
      consentChangeMail: ref(false)
    }
  },
  methods: {
    async modifyMail(){
      var submitForm = { email: this.toModify }
      await this.userStore.modifyEmail(submitForm)
    },
    async verifyMailHandler() {
      // TODO: 确定输入的邮箱符合邮箱的格式
/*       if (this.toModify != this.registeredMail && this.consentChangeMail) {
        console.log("not true but consent modify")
        await this.modifyMail()
      }
      else  */
      var localHandle =JSON.parse((JSON.parse(JSON.stringify(LocalStorage.getItem('user'))))).handle
      var localToken =LocalStorage.getItem('token')
      var localMail = JSON.parse((JSON.parse(JSON.stringify(LocalStorage.getItem('user'))))).email
      if (this.toModify === localMail){
        console.log("become true")
        var submitionForm = { email: localMail, handle: localHandle, token: localToken }
        await this.userStore.verifyAccount(localMail, localHandle, localToken)
      }
      // 如果邮箱相同就只是发送生成验证网址的邮件，否则就先发送修改邮箱的 API 然后发送生成验证网址的邮件
      console.log("send verify mail!", localMail, localHandle, localToken)
    },
    handleInsert() {
      console.log("props data is:", this.$props.insertData)
      switch (this.$props.insertData) {
        case 1:
          // this.userStore.resetPassword()
          // TODO: 确定输入的邮箱符合邮箱的格式
          var submitForm = { email: this.toModify }
          this.userStore.modifyEmail(submitForm)
          break;
        case 2:
          // this.userStore.modifyTelephone(submitForm)
          console.log("modify telephone!")
          break;
        case 3:
          this.verifyMailHandler()

          break;
        default:
          console.log("no submit")
      }
    }
  }
}
</script>
