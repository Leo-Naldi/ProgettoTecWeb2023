<template>
  <MyForm ref="form" @submit="onSubmit">
    <MyInput v-model="form.newPassword" label="new Password" :rules="[
      (val) => (val && val.length > 0) || 'length must greater than 0!',
    ]" class="q-pt-md" />
    <MyInput v-model="form.confirmPassword" label="confirm your password"
      :rules="[(val) => !!val || 'Email is missing', isValidPassword]" class="q-pt-md" />
    <div class="q-pt-lg row justify-between">
      <div class="col-6">
        <div class="row">
          <router-link :to="{ name: 'Login' }" class="col-12">
            <span>Have credentials?</span>
          </router-link>
        </div>
      </div>
      <div class="col-6 text-right">
        <MyButton label="Submit" aria-label="submit" type="submit" />
        <!-- <MyButton label="Submit" aria-label="submit" type="submit" :loading="isLoading" /> -->

      </div>
    </div>
  </MyForm>
</template>

<!-- <script setup>
import ModifyPassword from 'src/components/ModifyPassword.vue';

</script> -->

<script>
import { useUserStore } from "stores/user";
import { useGlobalStore } from "src/stores/global";
import { api } from "boot/axios";
import { useRouter } from "vue-router";
import { Notify } from "quasar";
import { computed } from "vue";

export default {
  props: {
    isForget: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      userStore: useUserStore(),
      globalStore: useGlobalStore(),
      router: useRouter(),
      form: {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      submitForm: {
        password: "",
      },
    };
  },
  methods: {
    //TODO:
    verifyPassword() {
      /*       var getToken = this.store.getUserToken;
            var getUser = this.store.getUser.handle;
            var res = false;
            api.defaults.headers.common["Authorization"] = "Bearer " + getToken;
            api
              .get("users/" + getUser)
              .then((response) => {
                if (response.status === 200) {
                  // console.log(this.form.oldPassword);
                  // console.log(response.data);
                  res = this.form.oldPassword === response.data.password;
                }
              })
              .catch((err) => {
                console.log(this.form.oldPassword);
                console.log(response.data.password);
              });
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve(res || "password not correct!");
              }, 1000);
            }); */
    },
    isValidPassword() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(
            this.form.newPassword === this.form.confirmPassword ||
            "the two passwords are different!"
          );
        }, 100);
      });
    },
    async onSubmit() {
      this.submitForm.password = this.form.newPassword
      const user_handle = computed(()=> this.globalStore.getVerifyHandle)
      const res = await this.userStore.resetPassword(user_handle.value, this.submitForm)
      console.log("submit password",res)
      if (res === 200) {
        this.router.push({
          path: "/login",
        });
      }
    }
  },
};
</script>
