<template>
  <q-item class="my-posts q-py-md">
    <q-item-section avatar top>
      <q-avatar color="blue-6" text-color="white" size="xl" @click.stop.prevent="gotoAuthor(author)">
        {{ author ? author[0] + author[1] : "Null" }}
      </q-avatar>
    </q-item-section>

    <q-item-section>
      <q-item-label class="my-post-info text-subtitle1">
        <div>
          <strong>{{ author ? author : "Null" }}</strong>
          <span class="text-grey-7 q-ml-sm">@{{ author ? author : "Null" }}</span>
          <!-- <span class="text-grey-7 q-ml-sm">&bull; 2h </span> -->
          <span class="text-grey-7 q-ml-sm">&bull; {{ relativeDate(meta.created) }} ago</span>
        </div>
        <q-btn flat round color="grey-5" icon="more_horiz" @click.stop>
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup v-if="canModify" @click="deletePost(id)">
                <q-item-section color="red">delete</q-item-section>
              </q-item>
              <q-item clickable v-close-popup v-if="canModify" @click="modifyPost(id)">
                <q-item-section>Modify</q-item-section>
              </q-item>
              <q-item clickable v-close-popup  @click="hidePost(id)">
                <q-item-section>Hide</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-item-label>
      <div class="post-content" v-html="content.text"></div>

      <q-img :src="content.image" v-if="content.image" spinner-color="white" class="my-img" />
      <!-- <MapTemplate v-if="meta.geo && meta.geo.coordinates.length != 0" :myPosition="meta.geo.coordinates"
          :style="$q.screen.gt.sm ? 'height: 280px; max-width:  100%' :  'height: 200px; max-width: 100%'" /> -->

      <div class="my-buttons q-mt-sm q-ml-sm text-grey-7">
        <div class="my-button" id="dislike">
          <q-btn flat round :color="disliked ? 'black' : 'grey'" :icon="disliked
              ? 'fa-sharp fa-solid fa-thumbs-down'
              : 'fa-sharp fa-regular fa-thumbs-down'
            " size="sm" id="dislikeBtn" @click.stop.prevent="addNegReaction(id)"></q-btn>
          <span> {{ reactions.negative }}</span>
        </div>
        <div class="my-button" id="like">
          <q-btn id="likeBtn" flat round :color="liked ? 'red' : 'grey'" :icon="liked
              ? 'fa-sharp fa-solid fa-thumbs-up'
              : 'fa-sharp fa-regular fa-thumbs-up'
            " size="sm" @click.stop.prevent="addPosReaction(id)">
          </q-btn>
          <span>{{ reactions.positive }}</span>

        </div>

        <div class="my-button" id="reply">
          <q-btn id="replyBtn" flat round icon="fa-regular fa-comment" size="sm" @click.stop.prevent="getPostsId(id)">
            <!-- <q-popup-proxy>
            <NewPosts :id="id" :author="author"></NewPosts>
          </q-popup-proxy> -->
          </q-btn>
          <span>{{ reactions.negative }}</span>
        </div>

        <div class="my-button" id="chart">
          <q-btn id="chartBtn" flat round icon="fa-solid fa-chart-simple" size="sm" @click.stop>
          </q-btn>
          <span>{{ meta.impressions }}</span>
        </div>

        <div class="my-button">
          <q-btn id="bookmark" flat round icon="fa-regular fa-bookmark" size="sm" @click.stop.prevent="addToBookmark(id)">
          </q-btn>
        </div>
      </div>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { useAuthStore } from "src/stores/auth";
import { usePostStore } from "src/stores/posts";
import { useRouter } from "vue-router";
import { formatDistance } from "date-fns";
import { parseISO } from "date-fns";

const props = defineProps({
  id: {
    type: String,
  },
  author: {
    type: String,
    default: "",
  },
  meta: {
    created: {
      type: Date,
      default: NaN,
    },
    lastModified: {
      type: Date,
      defaule: NaN,
    },
    geo: {
      type: String,
      default: "Point",
      coordinates: {
        type: Array,
        default: [],
      },
    },
    impressions: {
      type: Number,
      default: 0,
    },
  },
  content: {
    text: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
  },
  reactions: {
    positive: {
      type: Number,
      default: 0,
    },
    negative: {
      type: Number,
      default: 0,
    },
  },
  answering: {
    type: String,
    default: "",
  },
  liked: {
    type: Boolean,
    default: false,
  },
  disliked: {
    type: Boolean,
    default: false,
  },
  canModify:{
    type: Boolean,
    default: false,
  },
  hide:{
    type: Boolean,
    default: false,
  }
});

/******************************************
                    data
 *******************************************/
const postStore = usePostStore();

/******************************************
               functions
 *******************************************/
const gotoAuthor = (author) => {
  console.log("goto post's author page");
};

const relativeDate = (value) => {
  return formatDistance(parseISO(value), new Date());
};

// v-if：in UserPage(handle's page) only
const deletePost = (id) => { };
const modifyPost = (id) => { };

// ref from post store
const hidePost = (id) => {
  postStore.hidePost(id);
};
const addNegReaction = (id) => {
  postStore.add_negReaction(id)
};
const addPosReaction = (id) => {
  postStore.add_posReaction(id);
};
const addToBookmark = (id) => {
  postStore.addToBookmark(id);
};

/******************************************
                debug functions
 *******************************************/
const getPostsId = (id) => { };
</script>

<style lang="sass" scoped>
.my-posts
  display: flex
  align-items: flex-start
.post-content
  margin-bottom: 11px
  font-size: 15px
  line-height: 22px
  color: #333333

.my-post-info
  position: relative
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: 11px
  font-size: 17px
  div span
    font-size: 15px



.my-buttons
  display: flex
  justify-content: space-around

  &:hover
    border-radius: 100px

  #dislike:hover
    #dislikeBtn
      background-color: #f1d2c1
    span
      color: #f1d2c1
  #like:hover
    #likeBtn
      background-color: #f1d2d2
    span
      color: #f1d2d2
  #reply:hover
    #replyBtn
      background-color: #1da1f2
    span
      color: #1da1f2
  #bookmark:hover
    background-color: #f1d2a2
  #chart:hover
    #chartBtn
      background-color: #61ef80
    span
      color: #61ef80
.my-button
  display: flex
  justify-content: center
  align-content: center
  box-sizing: content-box
  padding: 0.5rem
  span
    margin-left: 0.3rem
    font-size: 12px
    margin-top:5px

.my-img
  display: flex
  border-radius: 12px
</style>

<!-- v-html -->
<style lang="sass">
.post-content
  a
    text-decoration: none
    color: #1da1f2
  a[href^="#/search/"]:hover
    // text-decoration: underline
    color: #ff7701
  a[href^="#/channels/"]:hover
    color: #e777a9
  a[href^="#/user/details/"]:hover
    color: #ff77e9
</style>
