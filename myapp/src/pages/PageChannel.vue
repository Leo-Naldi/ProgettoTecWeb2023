<template>
  <div class="row items-center">
    <div class="col-12 col-md-9">
      <q-input
        placeholder="Search your channels"
        class="q-ma-md"
        outlined
        rounded
        dense
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <!--       <q-select
        filled
        v-model="model"
        use-input
        input-debounce="0"
        label="Simple filter"
        :options="options"
        @filter="filterFn"
        style="width: 250px"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>
      </q-select> -->
    </div>
    <div class="col-12 col-md-3">
      <q-btn icon="fa-solid fa-plus" @click="gotoPage" label="create channel" />
    </div>
  </div>

  <q-separator color="grey-2" size="4px" />

  <p class="q-mt-none q-mb-md text-weight-bold text-h5 q-pa-lg">
    Your Created Channels
  </p>
  <div class="q-pa-md" style="max-width: 350px">
    <q-list bordered>
      <q-item
        v-for="channel in lists"
        :key="channel.id"
        class="q-my-sm"
        clickable
        v-ripple
        :to="{
          name: 'ListDetail',
          params: {
            channelName: channel.name,
          },
        }"
      >
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white">
            {{ channel.name[0] }}
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ channel.name }}</q-item-label>
          <q-item-label caption lines="1">
            <!-- <span class="text-grey-7"
                  >&bull;{{
            channel.members.length 
          }} members
          </span> -->
            <span class="text-grey-7"
              >{{ channel.members.length }} members
            </span>
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator />
    </q-list>
  </div>

  <q-separator color="grey-2" size="3px" />

  <p class="q-mt-none q-mb-md text-weight-bold text-h5 q-pa-lg">
    Your Joined Channels
  </p>
  <div class="q-pa-md" style="max-width: 350px">
    <q-list bordered>
      <q-item
        v-for="channel in lists2"
        :key="channel.id"
        class="q-my-sm"
        clickable
        v-ripple
        :to="{
          name: 'ListDetail',
          params: {
            channelName: channel.name,
          },
        }"
      >
        <!--       params:{
        channelId:channel._id,
        channelName:channel.name
      } -->
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white">
            {{ channel.name[0] }}
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label @click="jumpToPage">{{ channel.name }}</q-item-label>
          <q-item-label caption lines="1">
            <!-- <span class="text-grey-7"
                  >&bull;{{
            channel.members.length 
          }} members
          </span> -->
            <span class="text-grey-7"
              >{{ channel.members.length }} members
            </span>
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator />
    </q-list>
  </div>
</template>

<script>
import { useUserStore } from "stores/user";
import { api } from "boot/axios";

import { ref } from "vue";

export default {
  // name: 'PageName',

  /*   setup(){
    const options = ref(stringOptions)

    return {
      model: ref(null),
      options,

      filterFn (val, update) {
        if (val === '') {
          update(() => {
            options.value = stringOptions

            // here you have access to "ref" which
            // is the Vue reference of the QSelect
          })
          return
        }

        update(() => {
          const needle = val.toLowerCase()
          options.value = stringOptions.filter(v => v.toLowerCase().indexOf(needle) > -1)
        })
      }
    }

  }, */
  data() {
    return {
      store: useUserStore(),
      lists: [], // created channels
      lists2: [], // joined channels
      inputForm: {},
      input: "",
      channels: [],
    };
  },
  methods: {
    /* filterFn (val, update) {
        if (val === '') {
          update(() => {
            this.options.value = this.lists2

            // here you have access to "ref" which
            // is the Vue reference of the QSelect
          })
          return
        }

        update(() => {
          const needle = val.toLowerCase()
          this.options.value = this.lists2.filter(v => v.toLowerCase().indexOf(needle) > -1)
        })
      }, */
    searchResultPage() {
      this.$router.push("/channels");
    },
    // click the button to create channel
    gotoPage() {
      this.$router.push("/lists/create");
    },
    jumpToPage(event) {
      const target = event.target;
      console.log(event);
      if (event.target.textContent === "test1") {
      }
    },
  },
  mounted() {
    var getToken = this.store.getUserToken;
    api.defaults.headers.common["Authorization"] = "Bearer " + getToken;
    var getUser = this.store.getUser.handle;

    // get all channels created by user
    api
      .get("channels/" + getUser + "/created")
      .then((response) => {
        if (response.status === 200) {
          this.lists = response.data;
          // console.log(response.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    // Get all channels joined by this user
    api
      .get("channels/" + getUser + "/joined")
      .then((response) => {
        if (response.status === 200) {
          this.lists2 = response.data;
          for (var i = 0; i < this.lists2.length; i++) {
            this.channels.push(this.lists2[i].name);
          }
          console.log(this.channels);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },
};
</script>
