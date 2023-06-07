<template>
  <div class="demo form-bg">
    <q-card class="form-card">
      <q-card-section>
        <div class="text-h6" align="center">
          Edit your channel: {{ $route.params.channelName }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="editChannels" class="q-gutter-md">
          <q-input
            filled
            v-model="form.name"
            label="name"
            lazy-rules
            icon="person"
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
  <div class="demo form-bg">
    <q-card class="form-card">
      <q-card-section>
        <div class="text-h6" align="center">
          Delete your Channel: {{ $route.params.channelName }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="deleteChannel" class="q-gutter-md">
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
import { useRouter } from "vue-router";

export default {
  data() {
    return {
      store: useUserStore(),
      router: useRouter(),
      form: {
        name: "",
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
    editChannels() {
      var getToken = this.store.getUserToken;
      api.defaults.headers.common["Authorization"] = "Bearer " + getToken;
      var getUser = this.store.getUser.handle;

      // console.log("form,", this.form);
      // console.log("isPrivate?", this.isPrivate);

      this.form.publicChannel = this.isPrivate ? "false" : "true";
      var channelName = this.router.currentRoute.value.params;

      this.form.name =
        this.form.name == "" ? channelName.channelName : this.form.name;
      //TODO: Compare the similarities and differences between the data before and after and then make changes, currently you can only change whether the channel is public or not and the channel name, if the channel description is different from the original one, then it will definitely be changed.
      // console.log("dsagdsgasdgsdgsdg", this.form.publicChannel);

      api
        .put("channels/" + channelName.channelName, this.form)
        .then((response) => {
          if (response.status === 200) {
            this.resetData();
            alert("edited channel successfully!");
            this.gotoPage();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    deleteChannel() {
      api.defaults.headers.common["Authorization"] = "Bearer " + this.getToken;

      // Get the parameters passed through the route
      var channelName = this.router.currentRoute.value.params;
      alert("Are you sure you want to delete your data?");
      // console.log(channelName)
      var getToken = this.store.getUserToken;
      api.defaults.headers.common["Authorization"] = "Bearer " + getToken;

      api
        .delete("channels/" + channelName.channelName)
        .then((response) => {
          if (response.status === 200) {
            alert("you deleted your account!");
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
  mounted() {},
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
