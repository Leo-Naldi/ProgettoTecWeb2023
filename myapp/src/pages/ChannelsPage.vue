<template>
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
              >{{ channel.members ? channel.members.length : 0 }} members
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

export default {
  // name: 'PageName',
  data() {
    return {
      store: useUserStore(),
      lists: [], // created channels
      lists2: [], // joined channels
    };
  },
  methods: {
    // click the button to create channel
    gotoPage() {
      this.$router.push("/lists/create");
    },
    // TODO: Now responds only on the channel name's text area
    jumpToPage(event) {
      /*       const target = event.target;
      // console.log(event);
      if (event.target.textContent === "test1") {

      } */
    },
  },
  mounted() {
    var getToken = this.store.getUserToken;
    api.defaults.headers.common["Authorization"] = "Bearer " + getToken;

    // get all channels
    api
      .get("channels/")
      .then((response) => {
        if (response.status === 200) {
          this.lists2 = response.data;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },
};
</script>
