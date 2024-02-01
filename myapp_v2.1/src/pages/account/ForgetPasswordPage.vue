<template>
  <MyForm ref="form" @submit="onSubmit" role="form" aria-labelledby="forgetPassword-form-label">
    <div id="forgetPassword-form-label" class="visually-hidden">ForgetPassword Form</div>
    <MyInput v-model="user.email" label="Email" :rules="[v => required(v, 'Email'), v => email(v)]" class="q-pt-md" aria-label="ForgetPassword User Mail Input" aria-required="true" autofucus/>
    <div class="q-pt-lg row justify-between">
      <div class="col-6">
        <div class="row">
          <router-link :to="{ name: 'Login' }" class="col-12" role="link" tabindex="0">
            <span>Have credentials?</span>
          </router-link>
        </div>
      </div>
      <div class="col-6 text-right">
        <q-btn class="focus-style" label="Send" aria-label="SendForgetPassRequests" type="submit" :loading="isLoading" tabindex="0" role="button" />
      </div>
    </div>
  </MyForm>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

import useValidation from 'src/common/validation'
import { useAccountStore } from "src/stores/account";
import { useUserStore } from 'src/stores/user';

import { showNegative } from 'src/common/utils';


export default defineComponent({
  name: 'ForgotPassword',

  setup() {
    const { required, email } = useValidation();
    const { isLoading, checkMail, forgetPassword} = useAccountStore();


    const form = ref(null);
    const router = useRouter()

    const user = ref({ email: undefined });

    const onSubmit = (async ()=> {
      const user_email = user.value.email
      const request_Data= {"email":user_email}
      try{
        const res= await checkMail(request_Data)
        if(res.email!==false){
          useAccountStore().setVerifyEmail(user_email)
          useUserStore().setStoredUserJson(res.user)
        try{
          const res_=  await forgetPassword(request_Data)

          if(res_===200){
            router.push("/login/verify-code");
          }
        }
        catch(err){
          showNegative("mail verification failed due to unexpected error: ", err)
        }
      }
      else{
        showNegative("mail inserted not registered! Please change one!")
      }
      }
      catch(err){
        showNegative("unexpected error occured while verify the validation of mail, please try again latter! "+err)
      }
    });

    return {
      form,
      required,
      email,
      user,
      isLoading,
      onSubmit,
    };
  },
});
</script>
