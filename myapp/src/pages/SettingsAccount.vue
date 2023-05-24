<template>
  <div class="demo form-bg">
    <q-card class="form-card">
      <q-card-section>
        <div class="text-h6" align="center">Modify your account</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="modifyData" class="q-gutter-md">
          <q-input
            filled
            v-model="form.username"
            label="username"
            lazy-rules
            icon="person"
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
            :rules="['Email is missing', isValidEmail]"
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
  <div class="demo form-bg">
    <q-card class="form-card">
      <q-card-section>
        <div class="text-h6" align="center">Delete your account</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="deleteAccount" class="q-gutter-md">
          <q-card-actions align="center">
            <q-btn
              label="Delete"
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
        username: "",
        email: "",
      },
      submitForm1: {
        username: "",
      },
      submitForm2: {
        email: "",
      },
    };
  },
  methods: {
    refreshWin() {
      this.$router.push("/");

      location.reload();
    },
    deleteAccount() {
      alert("Are you sure you want to delete your data?");
      var getToken = this.store.getUserToken;
      api.defaults.headers.common["Authorization"] = "Bearer " + getToken;
      var getUser = this.store.getUser.handle;

      localStorage.clear();

      api
        .delete("users/" + getUser)
        .then((response) => {
          if (response.status === 200) {
            alert("you deleted your account!");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getSubmit() {
      if (this.form.username === "") {
        if (this.form.email != "") {
          this.submitForm2.email = this.form.email;
          console.log(this.submitForm2);
          return this.submitForm2;
        } else {
          return false;
        }
      } else {
        if (this.form.email === "") {
          this.submitForm1.username = this.form.username;
          console.log(this.submitForm1);
          return this.submitForm1;
        } else {
          return this.form;
        }
      }
    },
    modifyData() {
      var getToken = this.store.getUserToken;
      api.defaults.headers.common["Authorization"] = "Bearer " + getToken;
      var getUser = this.store.getUser.handle;

      if (this.getSubmit()) {
        api
          .post("users/" + getUser, this.getSubmit())
          .then((response) => {
            if (response.status === 200) {
              alert("you modified the data!");
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        alert("nothing to be changed!");
      }
    },
    isValidEmail(val) {
      const emailPattern =
        /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
      return emailPattern.test(val) || !val || "Invalid email";
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
