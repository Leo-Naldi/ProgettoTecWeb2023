<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute full-width full-height">
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
import { formatDistance } from "date-fns";
import { useUserStore } from "stores/user";
import { api } from "boot/axios";
import { parseISO } from "date-fns";

export default {
  name: "PageDisplore",
  data() {
    return {
      store: useUserStore(),
      newQweetContent: "",
      newQweetImage: "",
      coord: null, //[-122.5, 37.7]
      center: {}, //{lat: 51.093048, lng: 6.842120}
      markers: [],
      qweets: [],
    };
  },
  methods: {
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
    var getToken = this.store.getUserToken;
    api.defaults.headers.common["Authorization"] = "Bearer " + getToken;
    var qweet_tmp;
    var tmp = this.qweets;
    api
      .get("messages/")
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
      });
  },
};
</script>
