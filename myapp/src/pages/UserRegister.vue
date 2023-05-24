<template>
  <div class="demo form-bg">
    <q-card class="form-card">
      <q-card-section>
        <div class="text-h6" align="center">Register</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="register" class="q-gutter-md">
          <q-input
            filled
            v-model="form.handle"
            label="account"
            lazy-rules
            icon="person"
            :rules="[
              (val) => (val && val.length > 0) || 'please input username',
            ]"
          >
            <template v-slot:before>
              <q-icon name="person" class="on-left" />
            </template>
          </q-input>

          <q-input
            filled
            v-model="form.email"
            label="email"
            lazy-rules
            :rules="[(val) => !!val || 'Email is missing', isValidEmail]"
          >
            <template v-slot:before>
              <q-icon name="lock" class="on-left" />
            </template>
          </q-input>

          <q-input
            filled
            v-model="form.password"
            label="password"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'length must greater than 6!',
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
            :rules="[isValidPassword]"
          >
            <template v-slot:before>
              <q-icon name="lock" class="on-left" />
            </template>
          </q-input>

          <q-card-actions align="center">
            <q-btn
              label="Register"
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
        handle: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      submitForm: {
        email: "",
        password: "",
      },
    };
  },
  methods: {
    register() {
      this.submitForm.email = this.form.email;
      this.submitForm.password = this.form.password;
      api
        .put("users/" + this.form.handle, this.submitForm)
        .then((response) => {
          if (response.status === 200) {
            // console.log(response);

            alert("you've registerd! Welcome, " + response.data.handle + "!");

            this.$router.push("/login");
          }
        })
        .catch((err) => {
          if (err.response.status === 409) {
            this.$q.notify({
              color: "red",
              message: "username has already registered!",
            });
          }
          // console.log(err);
        });
      // console.log(this.form.handle);
      // console.log(this.form.email);
      // console.log(this.form.password);
      // console.log(this.form.confirmPassword);
    },
    isValidPassword() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(
            this.form.password === this.form.confirmPassword ||
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
