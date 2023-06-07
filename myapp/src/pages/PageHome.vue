<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute full-width full-height">
      <div class="q-py-lg q-px-md row items-end q-col-gutter-md">
        <div class="col">
          <q-input
            v-model="newQweetContent"
            class="new-qweet"
            placeholder="What's happening?"
            maxlength="10"
            bottom-slots
            counter
            autogrow
          >
            <template v-slot:before>
              <q-avatar size="xl">
                <img
                  src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=80"
                />
              </q-avatar>
            </template>
            <q-img
              :src="this.newQweetImage"
              v-if="this.newQweetImage"
              spinner-color="white"
              style="height: 140px; max-width: 150px"
            />
            <GMapMap
              v-if="this.coord"
              :center="this.center"
              :zoom="18"
              map-type-id="satellite"
              style="width: 300px; height: 100px"
            >
              <GMapMarker
                :key="marker.id"
                v-for="marker in this.markers"
                :position="marker.position"
              />
            </GMapMap>
            <q-btn
              flat
              round
              color="grey"
              icon="fas fa-map-marker-alt"
              size="sm"
              @click="getGeo()"
            />
          </q-input>
        </div>
        <div class="col col-shrink">
          <q-btn
            @click="addNewQweet"
            :disable="!newQweetContent"
            class="q-mb-lg"
            color="primary"
            label="Qweet"
            rounded
            unelevated
            no-caps
          />
        </div>
      </div>

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
                <strong>{{ store ? store.user.username : "" }}</strong>
                <span class="text-grey-7 text-caption q-ml-sm"
                  >@{{ store ? store.user.handle : "" }}</span
                >
                <!-- <q-item-label caption> -->
                <span class="text-grey-7"
                  >&bull;
                  {{
                    qweet.meta ? relativeDate(qweet.meta.created) : "?? ago"
                  }}</span
                >
                <!-- </q-item-label> -->
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
              <!-- <q-btn
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
                /> -->
              <!-- <q-btn
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
                />  -->
              <q-btn
                flat
                round
                color="grey"
                icon="fas fa-trash"
                size="sm"
                @click="deleteQweet(qweet)"
              />
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
  name: "PageHome",
  data() {
    return {
      store: useUserStore(),
      newQweetContent: "",
      newQweetImage: "",
      coord: null, //[-122.5, 37.7]
      center: {}, //{lat: 51.093048, lng: 6.842120}
      markers: [],
      qweets: [],
      submitting: false,
    };
  },
  methods: {
    relativeDate(value) {
      return formatDistance(parseISO(value), new Date());
    },
    addNewQweet() {
      /* without connect to db */
      // let newTweet = {
      //     content: this.newQweetContent,
      //     date: Date.now(),
      //     liked: false,
      //     dislike:false
      // };
      // this.qweets.unshift(newTweet);
      console.log("add new qweet");
      let newQweet = {};
      if (this.coord) {
        newQweet = {
          content: {
            text: this.newQweetContent,
            image: this.newQweetImage,
          },
          meta: {
            geo: {
              type: "Point",
              coordinates: this.coord,
            },
          },
        };
      } else {
        newQweet = {
          content: {
            text: this.newQweetContent,
            image: this.newQweetImage,
          },
        };
      }
      var getToken = this.store.getUserToken;
      api.defaults.headers.common["Authorization"] = "Bearer " + getToken;
      var getUser = this.store.getUser.handle;
      api
        .post("messages/" + getUser + "/messages", newQweet)
        .then((response) => {
          if (response.status === 200) {
            console.log("qweet added successfully!");
            this.qweets.unshift(newQweet);
            this.newQweetContent = "";
            this.newQweetImage = "";
            this.coord = null;
            this.center = {};
            this.markers = [];
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    deleteQweet(qweet) {
      console.log(qweet._id);
      //   /* without connect to db */
      //   let dateToDelete = qweet.date;
      //   let index = this.qweets.findIndex((qweet) => qweet.date === dateToDelete);
      //   this.qweets.splice(index, 1);
      //   console.log("delete qweet");
      var getToken = this.store.getUserToken;
      api.defaults.headers.common["Authorization"] = "Bearer " + getToken;
      var getUser = this.store.getUser.handle;
      api
        .delete("messages/" + getUser + "/messages/" + qweet._id)
        .then((response) => {
          if (response.status === 200) {
            console.log("qweet deleted successfully!");
            let toDelete = qweet._id;
            let index = this.qweets.findIndex(
              (qweet) => qweet._id === toDelete
            );
            this.qweets.splice(index, 1);
            this.newQweetContent = "";
            this.newQweetImage = "";
            this.coord = null;
            this.center = {};
            this.markers = [];
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    addMarker() {
      if (this.coord) {
        const marker = {
          lat: this.coord[0],
          lng: this.coord[1],
        };
        this.markers.push({ position: marker });
        this.center = marker;
      }
    },
    getGeo() {
      navigator.geolocation.getCurrentPosition((position) => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.coord = [position.coords.latitude, position.coords.longitude];
        this.addMarker();
      });
    },
    // TODO:one only can like/dislike other's tweets
    toggleDisliked(qweet) {
      console.log("qweet disliked");
    },
    toggleLiked(qweet) {
      let dateToDelete = qweet.date;
      let index = this.qweets.find((qweet) => qweet.date === dateToDelete);
      index.liked = true;

      console.log("qweet liked");
    },
    uploadImage(file) {
      var formData = new FormData();
      formData.append("files", file);
      var getUser = this.store.getUser.handle;
      api
        .post("image/upload/" + getUser, formData)
        .then((response) => {
          if (response.status === 200) {
            this.newQweetImage =
              "http://localhost:8000/" + getUser + "/" + response.data;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
  mounted() {
    var getToken = this.store.getUserToken;
    api.defaults.headers.common["Authorization"] = "Bearer " + getToken;
    var getUser = this.store.getUser.handle;
    var qweet_tmp;
    var tmp = this.qweets;
    api
      .get("messages/" + getUser + "/messages")
      .then((response) => {
        if (response.status === 200) {
          qweet_tmp = response.data;

          qweet_tmp.forEach(function (element) {
            if (!element.content) {
              console.log("not content, new content added");
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
    //TODO:listen only on form
    document.addEventListener("paste", async (e) => {
      e.preventDefault();
      const clipboardItems =
        typeof navigator?.clipboard?.read === "function"
          ? await navigator.clipboard.read()
          : e.clipboardData.files;

      for (const clipboardItem of clipboardItems) {
        let blob;
        if (clipboardItem.type?.startsWith("image/")) {
          blob = clipboardItem;
          this.uploadImage(blob);
        } else {
          const imageTypes = clipboardItem.types?.filter((type) =>
            type.startsWith("image/")
          );
          for (const imageType of imageTypes) {
            blob = await clipboardItem.getType(imageType);
            this.uploadImage(blob);
          }
        }
      }
    });
  },
  filters: {
    relativeDate(value) {
      return formatDistance(value, new Date());
    },
  },
};
</script>

<style lang="sass">
.new-qweet
    textarea
        font-size: 19px
        line-height: 1.4 !important
.divider
    border-top: 1px solid
    border-bottom: 1px solid
    border-color: $grey-4
.qweet:not(:first-child)
    border-top: 1px solid rgba(0, 0, 0, 0.12)
.qweet-content
    white-space: pre-line
.qweet-icons
    margin-left: -5px
</style>
