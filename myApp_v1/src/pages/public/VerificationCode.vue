


<template>
  <MyForm ref="form" @submit="onSubmit">
    <MyInput v-model="formData.verification_code" label="verification code" :rules="[ val => val.length == 6 || 'Please use 6 characters']" class="q-pt-md" />
    <div class="q-pt-lg row justify-between">
      <div class="col-6">
        <div class="row">
          <router-link :to="{ name: 'Login' }" class="col-12">
            <span>Have credentials?</span>
          </router-link>
        </div>
      </div>
      <div class="col-6 text-right">
        <MyButton label="Verify" aria-label="Verify" type="submit" :loading="isLoading" />
      </div>
    </div>
  </MyForm>
</template>

<script>
import { defineComponent, reactive, ref } from 'vue';
import useValidation from 'src/util/validation.js';
import { useAuthStore } from 'src/stores/auth.js';
import { useGlobalStore } from 'src/stores/global';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  name: 'ForgotPassword',

  setup() {
    const { required, email } = useValidation();
    const { isLoading, forgotPassword, verifyCode } = useAuthStore();

    const form = ref(null);
    const authStore = useAuthStore()
    const globalStore = useGlobalStore()
    const router=useRouter()
    const formData =reactive({
      mail:globalStore.getVerifyEmail,
      verification_code: ""
    })

    const user = ref({ email: undefined });

    const onSubmit = (async ()=> {
      const insert_code = formData.verification_code
      console.log("verify: ", insert_code)
      formData.verification_code= insert_code

      // console.log("formData of verification code：",formData)
      const res = await authStore.verifyCode(formData)
      console.log("verified with success?: ", res)
      if(res===200){
      router.push("/login/modify-password")
      }
      // authStore.checkAccount({"handle": "fv", "email": "fv@gmail.com"})
      // form.value.validate().then((success) => {
        // console.log("form value", form.value)
        // if (success) {
          // forgotPassword(user.value);
        // }
      // });
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
