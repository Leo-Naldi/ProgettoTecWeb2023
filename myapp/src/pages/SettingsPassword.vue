<template>
    <div class="demo form-bg">
    <q-card class="form-card">
      <q-card-section>
        <div class="text-h6" align="center">Reset your password</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="resetPassword" class="q-gutter-md">

          <q-card-actions align="center">
            <q-btn
              label="Reset"
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
  <div class="demo form-bg">
    <q-card class="form-card">
      <q-card-section>
        <div class="text-h6" align="center">Change your password</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="changePassword" class="q-gutter-md">
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
          </q-input>

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

export default {
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
    resetPassword(){
      var getToken = this.store.getUserToken;
      api.defaults.headers.common["Authorization"] = "Bearer " + getToken;
      var getUser = this.store.getUser.handle;

      this.submitForm.password = "123456";
      api
        .post("users/" + getUser, this.submitForm)
        .then((response) => {
          if (response.status === 200) {
            alert("you modified the password successfully!");
          }
        })
        .catch((err) => {
          console.log(err);
        });
      alert("You've just reset your password to 123456!")
    },
    verifyPassword() {
      var getToken = this.store.getUserToken;
      var getUser = this.store.getUser.handle;
      var res = false;
      api.defaults.headers.common["Authorization"] = "Bearer " + getToken;
      api
        .get("users/" + getUser)
        .then((response) => {
          if (response.status === 200) {
            res = this.form.oldPassword === response.data.password;
          }
        })
        .catch((err) => {
        });
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(res || "password not correct!");
        }, 1000);
      });
    },
    changePassword() {
      var getToken = this.store.getUserToken;
      api.defaults.headers.common["Authorization"] = "Bearer " + getToken;
      var getUser = this.store.getUser.handle;

      this.submitForm.password = this.form.newPassword;
      api
        .post("users/" + getUser, this.submitForm)
        .then((response) => {
          if (response.status === 200) {
            alert("you modified the password successfully!");
          }
        })
        .catch((err) => {
          console.log(err);
        });
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
    isValidEmail(val) {
      const emailPattern =
        /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
      return emailPattern.test(val) || "Invalid email";
    },
  },
};
</script>

<style>
/* set background color */

.demo {
  height: 100vh;

  display: flex;

  align-items: center;

  justify-content: center;

  background-image: linear-gradient(-225deg, #e3fdf5 0%, #ffe6fa 100%);
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
