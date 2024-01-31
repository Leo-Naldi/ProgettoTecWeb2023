<template>
  <MyForm ref="MyForm" @submit="onSubmit">
    <MyInput v-model="user.handle" label="Name" :rules="[v => required(v, 'Name')]" class="q-pt-md">
      <template v-slot:before>
        <q-icon name="person" class="on-left" />
      </template>
    </MyInput>

    <MyInput v-model="user.password" label="Password" :rules="[v => required(v, 'Password')]" class="q-pt-md"
      :type="visibility ? 'text' : 'password'">
      <template v-slot:before>
        <q-icon name="lock" class="on-left" />
      </template>
      <template #append>
        <q-icon :name="visibility ? 'visibility_off' : 'visibility'" class="cursor-pointer"
          @click="visibility = !visibility" />
      </template>
    </MyInput>

    <q-card-actions align="center" style="margin-top: 2rem">
      <MyButton type="submit"  @click="confirmPop=true" color="primary" class="focus-style" label="Login" ref="editButton" aria-label="LoginButton"  size="md" :loading="isLoading" />
      <!-- <q-dialog v-model="confirmPop" persistent>
      <q-card>
      <q-card-section class="row items-center">
        <span class="q-ml-sm">You have localStorage data non empty, do you want to use your localData overwrite db data?</span>
      </q-card-section>

      <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="noHandler()" v-close-popup />

          <q-btn flat label="I'm sure" color="primary" @click="yesHandler()"  v-close-popup />

      </q-card-actions>
    </q-card>
    </q-dialog> -->
    </q-card-actions>

    <q-card-actions align="between" style="margin-top: 1rem">
      <router-link :to="{ name: 'Register' }" class="block">
        <span>Don't have an account?</span>
      </router-link>
      <router-link :to="{ name: 'ForgotPassword' }" class="block">
        <span>Forgot password?</span>
      </router-link>
    </q-card-actions>
  </MyForm>
</template>

<script>
import { defineComponent, ref } from 'vue';

import useValidation from 'src/common/validation'
import { useAccountStore } from "src/stores/account";
import { usePostStore } from 'src/stores/post';
import { removePublicPosts } from 'src/common/localStorageHandler';
import { useChannelStore } from 'src/stores/channel';

export default defineComponent({
  name: 'LoginPage',

  setup() {
    const { required } = useValidation();
    const { isLoading, login } = useAccountStore();

    const MyForm = ref(null);
    const visibility = ref(false);

    const user = ref({ handle: "fv", password: "12345678" });

    const confirmPop = ref(false)
    const confirmRes = ref(null)
    const onSubmit = function () {
      MyForm.value.validate().then((success) => {
        if (success) {
          usePostStore().resetStorePublic();
          useChannelStore().resetStoredChannelPublic();
          removePublicPosts();
          login(user.value);
        }
      });
    };
    // watch(
    //   () => confirmRes.value,
    //   (newV) => {
    //     if (newV ==true) {
    //       MyForm.value.validate().then((success)=>{
    //         if (success){
    //           login(user.value);
    //         }
    //       })
    //     }
    //   }
    // )

    return {
      MyForm,
      required,
      user,
      isLoading,
      onSubmit,
      visibility,
      confirmPop,
      confirmRes
    };
  },
  methods:{
    noHandler(){
      this.confirmRes=false;
      // console.log("你选择了否", this.confirmRes);
    },
    yesHandler(){
      this.confirmRes=true;
      // console.log("你选择了是", this.confirmRes);
    }
  },
});
</script>

<style lang="sass" scoped >
.focus-style
  width: 100px
.focus-style:focus,.focus-style:focus-visible
  /* 添加聚焦时的样式，例如背景色或边框样式 */
  background-color: #ffcc00
  outline: 2px solid crimson
  border-radius: 3px

.focus-style:hover
  color: #1da1f2
  background-color: #e8f5ff

</style>
