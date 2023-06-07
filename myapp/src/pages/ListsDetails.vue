<template>
  <q-page class="relative-position">
    <p class="text-weight-bold text-h4">
      name: {{ $route.params.channelName }}
    </p>
    <p class="">Description: {{ channelDetails.description }}</p>
    <p class="">creator: {{ channelCreator }}</p>
    <p class="">members: {{ channelMembers }}</p>
    <q-scroll-area class="absolute full-width full-height">
      <!-- 

    if the channel creator, display "Edit", click to jump to the page of editing the channel;
    If not a channel member, display "follow", click to become a member of this channel;
    If you are a channel member, display "unfollow", click to exit from the current channel's membership
   -->
      <q-btn
        v-if="getUser === channelCreator"
        color="white"
        text-color="black"
        label="Edit"
        @click="editChannel"
        :to="{
          name: 'ListEdit',
          params: {
            channelName: $route.params.channelName,
          },
        }"
      />
      <q-btn
        v-if="!isMembers() && getUser !== channelCreator"
        color="white"
        text-color="black"
        label="Follow"
        @click="follow"
      />
      <q-btn
        v-if="isMembers() && getUser !== channelCreator"
        color="white"
        text-color="black"
        label="unfollow"
        @click="unfollow"
      />
      <q-separator class="divider" color="grey-2" size="10px" />

      <q-list separator>
        <q-item v-for="qweet in qweets" :key="qweet._id" class="qweet q-py-md">
          <q-item-section avatar top>
            <q-avatar size="xl">
              <img
                src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=80"
              />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label
              class="text-subtitle1 flex justify-between items-start"
            >
              <div>
                <strong>{{
                  qweet.author ? qweet.author.handle : "???"
                }}</strong>
                <span class="text-grey-7 text-caption q-ml-sm"
                  >@{{ qweet.author ? qweet.author.handle : "???" }}</span
                >
                <span class="text-grey-7 q-ml-sm"
                  >&bull; {{ relativeDate(qweet.meta.created) }}</span
                >
              </div>
              <q-btn flat round color="grey-5" icon="more_horiz" />
            </q-item-label>
            <q-item-label class="qweet-content text-body1">{{
              qweet.content.text
            }}</q-item-label>

            <q-img
              :src="qweet.content.image"
              v-if="qweet.content.image"
              spinner-color="white"
              style="height: 140px; max-width: 150px"
            />
            <GMapMap
              v-if="
                qweet.meta &&
                qweet.meta.geo &&
                qweet.meta.geo.coordinates[0] != null &&
                qweet.meta.geo.coordinates[0] != -1 &&
                qweet.meta.geo.coordinates[1] != -1
              "
              :center="{
                lat: qweet.meta.geo.coordinates[0],
                lng: qweet.meta.geo.coordinates[1],
              }"
              :zoom="15"
              map-type-id="terrain"
              style="width: 500px; height: 300px"
            >
              <GMapMarker
                :position="{
                  lat: qweet.meta.geo.coordinates[0],
                  lng: qweet.meta.geo.coordinates[1],
                }"
              />
            </GMapMap>
            <div class="qweet-icons row justify-between q-mt-sm">
              <span class="text-grey-7 q-ml-sm"
                ><q-btn
                  flat
                  round
                  :color="qweet.reactions.positive > 0 ? 'red' : 'grey'"
                  :icon="
                    qweet.reactions.positive > 0
                      ? 'fa-sharp fa-solid fa-thumbs-up'
                      : 'fa-sharp fa-regular fa-thumbs-up'
                  "
                  size="sm"
                  @click="toggleLiked(qweet)"
                />
                {{ qweet.reactions ? qweet.reactions.positive : NaN }}</span
              >
              <span class="text-grey-7 q-ml-sm">
                <q-btn
                  flat
                  round
                  :color="qweet.reactions.negative > 0 ? 'black' : 'grey'"
                  :icon="
                    qweet.reactions.negative > 0
                      ? 'fa-sharp fa-solid fa-thumbs-down'
                      : 'fa-sharp fa-regular fa-thumbs-down'
                  "
                  size="sm"
                  @click="toggleDisliked(qweet)"
                />{{ qweet.reactions ? qweet.reactions.negative : NaN }}</span
              >
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>
  </q-page>
</template>

<script>
import { useUserStore } from "stores/user";
import { api } from "boot/axios";
import { formatDistance } from "date-fns";
import { parseISO } from "date-fns";

import { useRouter } from "vue-router";

export default {
  // name: 'PageName',

  data() {
    return {
      store: useUserStore(),
      router: useRouter(),
      channelDetails: "",
      channelCreator: "",
      channelMembers: 0,
      getToken: useUserStore().getUserToken,
      getUser: useUserStore().getUser.handle,
      getUserId: useUserStore().getUser._id,
      newQweetContent: "",
      newQweetImage: "",
      coord: null, //[-122.5, 37.7]
      center: {}, //{lat: 51.093048, lng: 6.842120}
      markers: [],
      qweets: [],
    };
  },
  methods: {
    // Determine if the currently logged-in user is a member of the channel currently being viewed: user, find if the ObjectId of the current channel is included in the channel the user joined
    isMembers() {
      var res = false;
      if (!this.channelDetails.members) return false;
      var searchRes = this.channelDetails.members.indexOf(this.getUserId);
      if (searchRes != -1) res = true;
      return res;
    },
    // Determine whether the currently logged-in user is the creator of the channel currently being viewed
    isCreator() {
      console.log(this.getUser === this.channelCreator);
    },
    unfollow() {
      console.log("unfollow");

      var getToken = this.store.getUserToken;
      api.defaults.headers.common["Authorization"] = "Bearer " + getToken;
      var getUser = this.store.getUser.handle;

      api
        .post("users/" + getUser, {
          removeJoinedChannels: [
            this.router.currentRoute.value.params.channelName,
          ],
        })
        .then((response) => {
          if (response.status === 200) {
            alert("you modified the data!");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    follow() {
      console.log("follow");
      var getToken = this.store.getUserToken;
      api.defaults.headers.common["Authorization"] = "Bearer " + getToken;
      var getUser = this.store.getUser.handle;

      api
        .post("users/" + getUser, {
          addJoinedChannels: [
            this.router.currentRoute.value.params.channelName,
          ],
        })
        .then((response) => {
          if (response.status === 200) {
            alert("you modified the data!");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    editChannel() {
      console.log("edit");
    },
    relativeDate(value) {
      return formatDistance(parseISO(value), new Date());
    },
    toggleDisliked(qweet) {
      const loggedUser = this.store.getUser.handle;
      const msgAuthor = qweet.author.handle;
      if (loggedUser != msgAuthor) {
        console.log("qweet disliked");
      } else {
        alert("you cannot dislike your own tweets! ");
      }
    },
    toggleLiked(qweet) {
      const loggedUser = this.store.getUser.handle;
      const msgAuthor = qweet.author.handle;
      if (loggedUser != msgAuthor) {
        console.log("qweet Liked");
      } else {
        alert("you cannot like your own tweets! ");
      }
    },
  },
  mounted() {
    api.defaults.headers.common["Authorization"] = "Bearer " + this.getToken;

    // Get the parameters passed through the route
    const router = useRouter();
    var channelName = router.currentRoute.value.params;
    // console.log(channelName);
    var qweet_tmp;
    var tmp = this.qweets;
    // var params1 = {    "dest":["§test6"]}
    var emptylist = [];
    emptylist.push("§" + channelName.channelName);
    var params = { dest: emptylist };

    // Get the raw data of the channel from the channel name
    api
      .get("channels/" + channelName.channelName)
      .then((response) => {
        if (response.status === 200) {
          this.channelDetails = response.data;
          this.channelMembers = response.data.members.length;
        }
      })
      .catch((err) => {
        console.log(err);
      });

    api
      .get("messages/", { params: params })
      .then((response) => {
        if (response.status === 200) {
          // console.log(params1)
          // console.log(params2)
          qweet_tmp = response.data;

          qweet_tmp.forEach(function (element) {
            if (!element.content) {
              let tt = element;
              tt.content = { text: "", image: "" };
              tt.meta.geo = { types: "Point", coordinates: [] };
              tmp.unshift(tt);
            } else {
              tmp.unshift(element);
            }
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });

    // Get the handle name of the creator from the ObjectId of the creator of the returned data of the channel
    api
      .get("channels/" + channelName.channelName + "/creator")
      .then((response) => {
        if (response.status === 200) {
          this.channelCreator = response.data;
        }
      })
      .catch((err) => {
        console.log(err);
      });

    /* var qweet_tmp;
    var tmp = this.qweets;
    var destChannel = router.currentRoute.value.params;
    // console.log("channelName: ",destChannel.channelName);
    
    // my api to get all messages of a channel
    api
      .get("messages/" +destChannel.channelName, {channelID: this.channelDetails._id})
      .then((response) => {
        if (response.status === 200) {
          qweet_tmp = response.data;

          qweet_tmp.forEach(function (element) {
            if (!element.content) {
              let tt = element;
              tt.content = { text: "", image: "" };
              tt.meta.geo = { types: "Point", coordinates: [] };
              tmp.unshift(tt);
            } else {
              tmp.unshift(element);
            }
          });
        }
      })
      .catch((err) => {
        console.log(err);
      }); */
  },
};
</script>
