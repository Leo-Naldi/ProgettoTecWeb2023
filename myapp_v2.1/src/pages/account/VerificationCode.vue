<template>
  <MyForm ref="form" @submit="onSubmit" role="form" aria-labelledby="verification-form-label">
    <div id="verification-form-label" class="visually-hidden">Verification Form</div>
    <MyInput v-model="formData.verification_code" label="Verification Code"
      :rules="[val => val.length === 6 || 'Please use 6 characters']" class="q-pt-md" aria-label="Verification Code Input" aria-required="true" />
    <div class="q-pt-lg row justify-between">
      <div class="col-6">
        <div class="row">
          <router-link :to="{ name: 'Login' }" class="col-12" role="link" tabindex="0">
            <span>Have credentials?</span>
          </router-link>
        </div>
      </div>
      <div class="col-6 text-right">
        <q-btn class="focus-style" label="Verify" aria-label="Verify Button" type="submit" :loading="isLoading" role="button" tabindex="0"/>
      </div>
    </div>
  </MyForm>
</template>


<script>
import { defineComponent, reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';


import useValidation from 'src/common/validation'
import { useAccountStore } from "src/stores/account";
import { useUserStore } from 'src/stores/user';

import { showNegative } from 'src/common/utils';

export default defineComponent({
  name: 'ForgotPassword',

  setup() {
    const { required } = useValidation();
    const { isLoading, verifyCode } = useAccountStore();

    const form = ref(null);
    const router = useRouter()

    const formData = reactive({
      mail: useAccountStore().getVerifyEmail,
      verification_code: ""
    })


    const onSubmit = (async () => {
      // console.log("formData of verification code：",formData)
      try {
        console.log("[verify code] to send is: ", formData)
        const res = await verifyCode(formData)
        // console.log("verified with success?: ", res)
        if (res === 200) {
          router.push("/login")
        }
      } catch (err) {
        showNegative("unexpected error occured while check the validation of verify code, please try again latter! " + err)
      }
    });

    return {
      form,
      required,
      isLoading,
      onSubmit,
      formData
    };
  },
});
</script>

