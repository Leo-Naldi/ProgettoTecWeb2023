<template>
  <MyForm role="form" aria-label="Login Form" aria-labelledby="login-form-label" ref="MyForm" @submit="onSubmit">
    <MyInput label="Name"  v-model="user.handle"  :rules="[v => required(v, 'Name')]" class="q-pt-md">
      <template v-slot:before>
        <q-icon name="person" class="on-left" />
      </template>
    </MyInput>

    <MyInput label="Password"  v-model="user.password"  :rules="[v => required(v, 'Password')]" class="q-pt-md"
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
      <!-- <MyButton type="submit"  @click="confirmPop=true" color="primary" class="focus-style" label="Login" ref="editButton" aria-label="Login"  size="md" :loading="isLoading" /> -->
      <q-btn class="focus-style" label="Login" ref="editButton" aria-label="Logina" type="submit"  size="md" :loading="isLoading" />

      <!--
        // if save public reaction to logged user
      <q-dialog role="dialog" aria-labelledby="confirm-dialog-label" v-model="confirmPop" persistent>
      <q-card>
      <q-card-section class="row items-center">
        <span class="q-ml-sm">You have localStorage data non empty, do you want to use your localData overwrite db data?</span>
      </q-card-section>

      <q-card-actions align="right">
          <q-btn aria-label="Cancel" flat label="Cancel" color="primary" @click="noHandler()" v-close-popup />

          <q-btn aria-label="Confrim" flat label="I'm sure" color="primary" @click="yesHandler()"  v-close-popup />

      </q-card-actions>
    </q-card>
    </q-dialog> -->
    </q-card-actions>

    <q-card-actions align="between" style="margin-top: 1rem">
      <router-link aria-label="Register" :to="{ name: 'Register' }" class="block">
        <span>Don't have an account?</span>
      </router-link>
      <router-link aria-label="ForgotPassword" :to="{ name: 'ForgotPassword' }" class="block">
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
/*   methods:{
    noHandler(){
      this.confirmRes=false;
      // console.log("you've choosen no", this.confirmRes);
    },
    yesHandler(){
      this.confirmRes=true;
      // console.log("you0ve choose yes", this.confirmRes);
    }
  }, */
});
</script>

