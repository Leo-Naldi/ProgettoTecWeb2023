<template>
  <div class="demo form-bg">
    <div class="logo">
      <p style="font-size: 35px"><strong>logo</strong></p>
    </div>

    <q-card class="form-card">
      <q-card-section>
        <div class="text-h5" align="center">Login</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="login" class="q-gutter-md">
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
            v-model="form.password"
            label="password"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'please input password',
            ]"
          >
            <template v-slot:before>
              <q-icon name="lock" class="on-left" />
            </template>
          </q-input>
          <q-card-actions align="center">
            <q-btn
              label="Login"
              type="submit"
              color="primary"
              size="md"
              style="width: 100px"
            />
          </q-card-actions>

          <q-card-actions align="between">
            <q-btn
              label="Register"
              to="/register"
              @click="onRegistere"
              color="grey-5"
              flat
            />

            <q-btn
              label="Forget password?"
              @click="onForget"
              color="grey-5"
              flat
            />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { useUserStore } from "stores/user";

export default {
  data() {
    return {
      store: useUserStore(),
      form: {
        handle: "",
        password: "",
      },
    };
  },
  methods: {
    login() {
      api
        .post("auth/login", this.form)
        .then((response) => {
          if (response.status === 200) {
            // console.log(response.data);
            alert("you've logged in! " + response.data.user.username);

            let token = response.data.token;

            this.store.setAuth(true);
            // console.log(this.store.getAuthenticated);
            this.store.setUser(response.data.user);
            this.store.setUserToken(response.data.token);
            // console.log(this.store.getUserToken);

            // console.log(response.data.user);
            localStorage.setItem("token", token);
            this.$router.push("/");
          }
        })
        .catch((err) => {
          if (err.response.status === 409) {
            this.$q.notify({
              color: "red",
              message: "name or password not correct",
            });
          }
          // console.log(err);
        });
    },
  },
};
</script>

<script setup>
import { api } from "boot/axios";

const onRegistere = () => {
  console.log("registere");
};

const onForget = () => {
  console.log("forget");
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

/* set login form style */

.form-bg {
  background-color: rgba(255, 255, 255, 0.5);

  border-radius: 10px;

  padding: 20px;
}

.form-card {
  width: 400px;
}

/* set logo(possible?) style */

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
