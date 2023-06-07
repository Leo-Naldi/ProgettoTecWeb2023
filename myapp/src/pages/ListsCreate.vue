<template>
  <div class="demo form-bg">
    <q-card class="form-card">
      <q-card-section>
        <div class="text-h6" align="center">Create your channels</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="createChannels" class="q-gutter-md">
          <q-input
            filled
            v-model="form.name"
            label="name"
            lazy-rules
            icon="person"
            :rules="[
              (val) =>
                (val && val.length > 0) || 'please input the channel name',
            ]"
          >
            <template v-slot:before>
              <q-icon name="person" class="on-left" />
            </template>
          </q-input>

          <q-input filled v-model="form.description" label="description">
            <template v-slot:before>
              <q-icon name="lock" class="on-left" />
            </template>
          </q-input>
          <div>
            <q-checkbox v-model="isPrivate" label="Set Private" />
          </div>

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
        name: "",
        ownerHandle: "",
        description: "",
        publicChannel: "true",
      },
      isPrivate: false,
    };
  },
  methods: {
    gotoPage() {
      this.$router.push("/channel");
    },
    // TODO: when completed, redirect to the channel page
    createChannels() {
      var getToken = this.store.getUserToken;
      api.defaults.headers.common["Authorization"] = "Bearer " + getToken;
      var getUser = this.store.getUser.handle;

      this.form.ownerHandle = getUser;
      console.log("form,", this.form);
      console.log("isPrivate?", this.isPrivate);

      this.form.publicChannel = this.isPrivate ? "false" : "true";
      console.log("dsagdsgasdgsdgsdg", this.form.publicChannel);

      api
        .post("channels/" + getUser, this.form)
        .then((response) => {
          if (response.status === 200) {
            this.resetData();
            alert("created channel successfully!");
            this.gotoPage();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    resetData() {
      this.form.name = "";
      this.form.description = "";
      this.ownerHandle = "";
      this.form.publicChannel = true;
      this.isPrivate = false;
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
