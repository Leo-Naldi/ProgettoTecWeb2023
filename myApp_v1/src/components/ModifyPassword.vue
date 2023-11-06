<template>
  <div class="demo form-bg">
    <q-card class="form-card" flat>
      <q-card-section v-if="!isForget">
        <div class="text-h6" align="center">Change your password</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="changePassword" class="q-gutter-md">
          <!--
            //TODO: verify current password!
            <q-input
            filled
            v-model="form.oldPassword"
            label="old Password"
            lazy-rules
            icon="lock"
            :rules="[(val) => !!val || 'Email is missing', verifyPassword]"
          >
            <template v-slot:before>
              <q-icon name="lock" class="on-left" />
            </template>
          </q-input> -->

          <q-input
            filled
            v-model="form.newPassword"
            label="new Password"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'length must greater than 0!',
            ]"
          >
            <template v-slot:before>
              <q-icon name="lock" class="on-left" />
            </template>
          </q-input>

          <q-input
            filled
            v-model="form.confirmPassword"
            label="confirm your password"
            lazy-rules
            :rules="[(val) => !!val || 'Email is missing', isValidPassword]"
          >
            <template v-slot:before>
              <q-icon name="lock" class="on-left" />
            </template>
          </q-input>

          <q-card-actions align="center">
            <q-btn
              label="Submit"
              type="submit"
              color="primary"
              size="md"
              style="width: 100px"
            />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { useUserStore } from "stores/user";
import { api } from "boot/axios";
import { Notify } from "quasar";

export default {
  props:{
    isForget:{
      type: Boolean,
      default:false
    }
  },
  data() {
    return {
      store: useUserStore(),
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
    changePassword() {
      this.submitForm.password=this.form.newPassword
      const user_handle = this.store.getUserHandle();
      this.store.resetPassword(user_handle, this.submitForm)
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
  },
};
</script>

<style>
/* set background color */

.demo {
  height: 60vh;

  display: flex;

  align-items: center;

  justify-content: center;

  /* background-image: linear-gradient(-225deg, #e3fdf5 0%, #ffe6fa 100%); */
}

/* set login form style*/

.form-bg {
  background-color: rgba(255, 255, 255, 0.5);

  border-radius: 10px;

  padding: 20px;
}

.form-card {
  width: 400px;
}

/* set logo(maybe?) style */

.logo {
  width: 100%;

  text-align: center;

  margin-bottom: 20px;

  position: absolute;

  top: 100px;
}

.logo img {
  width: 300px;
}
</style>
