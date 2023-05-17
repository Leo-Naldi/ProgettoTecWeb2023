<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute full-width full-height">
      <div class="q-py-lg q-px-md row items-end q-col-gutter-md">
        <div class="col">
          <q-input
            v-model="newQweetContent"
            class="new-qweet"
            placeholder="What's happening?"
            maxlength="280"
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
        <transition-group
          appear
          enter-active-class="animated fadeIn slow"
          leave-active-class="animated fadeOut slow"
        >
          <q-item
            v-for="qweet in qweets"
            :key="qweet._id"
            class="qweet q-py-md"
          >
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
                  <strong>{{store ? store.user.username: ''}}</strong>
                  <span class="text-grey-7 text-caption q-ml-sm"
                    >@{{store ? store.user.handle: ''}}</span
                  >
                  <q-item-label caption>
                    <!-- <span class="text-grey-7"
                      >&bull; {{ relativeDate(qweet.meta.created) }}</span
                    > -->
                  </q-item-label>
                </div>
                <q-btn flat round color="grey-5" icon="more_horiz" />
              </q-item-label>
              <q-item-label class="qweet-content text-body1">{{
                qweet.content.text
              }}</q-item-label>
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
        </transition-group>
      </q-list>
    </q-scroll-area>
  </q-page>
</template>

<script>
import { formatDistance } from "date-fns";
import { useUserStore } from "stores/user";
import { api } from "boot/axios";

export default {
  name: "PageHome",
  data() {
    return {
      store: useUserStore(),
      newQweetContent: "",
      qweets: [
        // {
        //   id: "ID1",
        //   content: "dsgadgasdgsdgsdagd",
        //   date: 1611653238221,
        //   liked:false,
        //   disliked:true,
        //   //TODO:
        // },
        // {
        //   id: "ID2",
        //   content:
        //     "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed feugiat justo id viverra consequat. Integer feugiat lorem faucibus est ornare scelerisque. Donec tempus, nunc vitae semper sagittis, odio magna semper ipsum, et laoreet sapien mauris vitae arcu.",
        //   date: 1611653252444,
        //   liked:true,
        //   disliked:false,
        //   //TODO:
        // },
      ],
      submitting: false,
    };
  },
  methods: {
    // relativeDate(value){
    //   return formatDistance(value, new Date())
    // },
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
      let newQweet = {
        content: {
          text: this.newQweetContent,
        },
      };
      var getToken = this.store.getUserToken;
      api.defaults.headers.common["Authorization"] = "Bearer " + getToken;
      var getUser = this.store.getUser.handle;
      api
        .post("user/" + getUser + "/messages", newQweet)
        .then((response) => {
          if (response.status === 200) {
            console.log("qweet added successfully!");
            this.qweets.unshift(newQweet);
            this.newQweetContent = " ";
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
        .delete("user/" + getUser + "/messages/" + qweet._id)
        .then((response) => {
          if (response.status === 200) {
            console.log("qweet deleted successfully!");
            let toDelete = qweet._id;
            let index = this.qweets.findIndex(
              (qweet) => qweet._id === toDelete
            );
            this.qweets.splice(index, 1);
            this.newQweetContent = " ";
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    toggleDisliked(qweet) {
      console.log("qweet disliked");
    },
    toggleLiked(qweet) {
      let dateToDelete = qweet.date;
      let index = this.qweets.find((qweet) => qweet.date === dateToDelete);
      index.liked = true;

      console.log(this.qweets);
      console.log("qweet liked");
    },
  },
  mounted() {
    var getToken = this.store.getUserToken;
    api.defaults.headers.common["Authorization"] = "Bearer " + getToken;
    var getUser = this.store.getUser.handle;
    var qweet_tmp;
    var tmp = this.qweets;
    api
      .get("user/" + getUser + "/messages")
      .then((response) => {
        if (response.status === 200) {
          // console.log(response.data);
          qweet_tmp = response.data;
          // this.qweets = qweet_tmp;
          // console.log(this.qweets)

          qweet_tmp.forEach(function (element) {
            if (!element.content) {
              let tt = element;
              tt.content = { text: "" };
              tmp.unshift(tt);
            } else {
              tmp.unshift(element);
            }
            // console.log(element);
          });

          //   console.log(response.data[9].reactions.positive);
          // console.log(response.data[9].reactions.negative);
          // console.log(response.data[9].meta.created);
          // var t1 = response.data[0].content? response.data[0].content : ""
          // console.log(t1);
        }
      })
      .catch((err) => {
        console.log(err);
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
