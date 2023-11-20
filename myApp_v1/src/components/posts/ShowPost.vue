<template>
  <q-item class="my-posts q-py-md" @click="goToDetails(id)">
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
              <q-item v-if="canModify" clickable v-close-popup @click="deletePost(id)">
                <q-item-section color="red">delete</q-item-section>
              </q-item>
              <q-item v-if="canModify" clickable v-close-popup @click="modifyPost(id)">
                <q-item-section>Modify</q-item-section>
              </q-item>
              <q-item v-if="!canModify" clickable v-close-popup>
                <q-item-section @click="hidePost(id)" v-if="!hide">Hide</q-item-section>
                <q-item-section @click="cancelHidePost(id)" v-else>Cancel Hide</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-item-label>
      <div class="post-content" v-html="content.text"></div>

      <q-img :src="content.image" v-if="content.image" spinner-color="white" class="my-img" />
      <!--       <ShowMap v-if="meta.geo && meta.geo.coordinates.length != 0"  :myPosition="meta.geo.coordinates"
          :style="$q.screen.gt.sm ? 'height: 280px; max-width:  100%' :  'height: 200px; max-width: 100%'" /> -->
      <ShowMap v-if="meta.geo && meta.geo.coordinates.length != 0" :mapId="id" :my-position="meta.geo.coordinates">
      </ShowMap>
      <!-- <GMapMap
            v-if="meta.geo && meta.geo.coordinates.length != 0"
              :center="{
                lat: meta.geo.coordinates[0],
                lng: meta.geo.coordinates[1],
              }"
              :zoom="15"
              map-type-id="terrain"
              style="width: 500px; height: 300px"
            >
              <GMapMarker
                :position="{
                  lat: meta.geo.coordinates[0],
                  lng: meta.geo.coordinates[1],
                }"
              />
            </GMapMap> -->

      <div class="my-buttons q-mt-sm q-ml-sm text-grey-7">
        <div class="my-button" id="dislike">
          <q-btn flat round :color="hasLiked.disliked ? 'black' : 'grey'" :icon="hasLiked.disliked
            ? 'fa-sharp fa-solid fa-thumbs-down'
            : 'fa-sharp fa-regular fa-thumbs-down'
            " size="sm" id="dislikeBtn" @click.stop.prevent="addNegReaction(id)"></q-btn>
          <span> {{ reactiveCnt.negative }}</span>
        </div>
        <div class="my-button" id="like">
          <q-btn id="likeBtn" flat round :color="hasLiked.liked ? 'red' : 'grey'" :icon="hasLiked.liked
            ? 'fa-sharp fa-solid fa-thumbs-up'
            : 'fa-sharp fa-regular fa-thumbs-up'
            " size="sm" @click.stop.prevent="addPosReaction(id)">
          </q-btn>
          <span>{{ reactiveCnt.positive }}</span>

        </div>

        <div class="my-button" id="reply" @click.stop>
          <q-btn id="replyBtn" flat round icon="fa-regular fa-comment" size="sm">
            <!-- @click.stop.prevent="showReplies(id)" -->
            <q-popup-proxy v-if="router.currentRoute.value.name != 'PostDetail'">
              <WritePost :id="id" :author="author" />
            </q-popup-proxy>
          </q-btn>
          <span>{{ postReplies.length }}</span>
        </div>

        <div class="my-button" id="chart">
          <q-btn id="chartBtn" flat round icon="fa-solid fa-chart-simple" size="sm" @click.stop>
          </q-btn>
          <span>{{ meta.impressions }}</span>
        </div>

        <div class="my-button">
          <q-btn id="bookmark" flat round :icon="collected ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'" size="sm"
            @click.stop.prevent="bookmarkHandler(collected, id)">
          </q-btn>
        </div>
      </div>
    </q-item-section>

  </q-item>
</template>

<script setup>
import { useAuthStore } from "src/stores/auth";
import { usePostStore } from "src/stores/posts";
import { useUserStore } from "src/stores/user";
import { useRouter } from "vue-router";
import { formatDistance } from "date-fns";
import { parseISO } from "date-fns";
import { onMounted, reactive, ref } from "vue";
import ShowMap from 'src/components/map/ShowMap.vue'
import WritePost from "./WritePost.vue";

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
  /*   liked: {
      type: Boolean,
      default: false,
    },
    disliked: {
      type: Boolean,
      default: false,
    }, */
  canModify: {
    type: Boolean,
    default: false,
  },
  collected: {
    type: Boolean,
    default: false,
  },
  hide: {
    type: Boolean,
    default: false,
  }
});

/******************************************
                    data
 *******************************************/
const postStore = usePostStore();
const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();

const reactiveCnt = reactive({
  positive: props.reactions.positive,
  negative: props.reactions.negative
})
const hasLiked = reactive({
  liked: false,
  disliked: false
})

/******************************************
               functions
 *******************************************/
const gotoAuthor = (author) => {
  console.log("goto post's author page");
};

const goToDetails = ((id) => {
  router.push({
    name: "PostDetail",
    params: {
      postId: id,
    },
  });
})

const relativeDate = (value) => {
  return formatDistance(parseISO(value), new Date());
};

// v-if：in UserDetails(handle's page) only
const deletePost = (id) => { };
const modifyPost = (id) => { };

// ref from post store
const hidePost = (id) => {
  postStore.hidePost(id);
};
const cancelHidePost = (id) => {
  postStore.cancelHidePost(id)
}

const bookmarkHandler = (collected, id) => {
  if (!collected) {
    postStore.addToBookmark(id);
  }
  else {
    postStore.removeBookmark(id)
  }
};

const userLikes = reactive({
  userLiked: null,
  userDisliked: null
})

const postReplies = ref([])

const fetchUserData = async (author) => {
  const data = await userStore.findUser(author)
  userLikes.userLiked = data.liked
  userLikes.userDisliked = data.disliked
  if (userLikes.userLiked.includes(props.id)) {
    hasLiked.liked = true
  }
  if (userLikes.userDisliked.includes(props.id)) {
    hasLiked.disliked = true
  }
}
const fetchPostReplies = async (id) => {
  const data = await postStore.fetchReplis(id)
  postReplies.value = data
}

const addPosReaction = async (id) => {
  const data = await postStore.add_posReaction(id);
  console.log("up status", data)
  if (data == 200) {
    hasLiked.liked = true
    reactiveCnt.positive += 1
  }
  else if (data == 409) {
    hasLiked.liked = false
    reactiveCnt.positive > 0 ? reactiveCnt.positive -= 1 : reactiveCnt.positive
  }
}

const addNegReaction = async (id) => {
  const data = await postStore.add_negReaction(id);
  console.log("down status", data)
  if (data == 200) {
    hasLiked.disliked = true
    reactiveCnt.negative += 1
  }
  else if (data == 409) {
    hasLiked.disliked = false
    reactiveCnt.negative -= 1
  }
}

const showReplies = (id) => { alert("查看回复！") };

onMounted(() => {
  const paramId = router.currentRoute.value.params.userId;
  const searchLikes = paramId ? paramId : authStore.getUserHandle()
  fetchUserData(searchLikes)
  fetchPostReplies(props.id)
})

/******************************************
                debug functions
 *******************************************/


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
  a[href^="#/channel/"]:hover
    color: #e777a9
  a[href^="#/user/details/"]:hover
    color: #ff77e9
</style>
