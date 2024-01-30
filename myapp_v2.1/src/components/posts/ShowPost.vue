<template>
  <q-item class="my-posts q-py-md" @click="goToDetails(id)">
    <q-item-section avatar top>
      <q-avatar color="lime-6" text-color="white" size="xl" @click.stop.prevent="gotoAuthor(author)">
        {{ author ? author[0] + author[1] : "Null" }}
        <div v-if="userDetails.verified==true">
          <q-icon name="fa-solid fa-circle-check" class="verified" size="1rem" />
        </div>
      </q-avatar>
    </q-item-section>


    <q-item-section>
      <q-item-label class="my-post-info text-subtitle1">
        <div>
          <strong>{{ author ? author : "Null" }}</strong>
          <span class="text-grey-7 q-ml-sm">@{{ author ? author : "Null" }}
            <!--
              // OK 但是有点卡
              <div class="q-ml-sm rounded-rectangle" >
                <p style="display:inline">{{ userDetails.admin? Admin:userDetails.accountType }}</p>
              </div> -->
          </span>
          <!-- <span class="text-grey-7 q-ml-sm">&bull; 2h </span> -->
          <span class="text-grey-7 q-ml-sm">&bull; {{ relativeDate(meta.created) }} ago</span>
        </div>
        <q-btn flat round color="grey-5" icon="more_horiz" @click.stop>
          <q-menu>
            <q-list style="min-width: 100px">
              <!-- can modify solo nel userPage -->
              <q-item v-if="canModify" clickable v-close-popup @click="deletePost(id)">
                <q-item-section color="red">delete</q-item-section>
              </q-item>
              <q-item v-if="canModify" clickable v-close-popup @click="modifyPost(id)">
                <q-item-section>Modify</q-item-section>
              </q-item>
              <!-- can hide only posts not write by myself -->
              <q-item v-if="!canModify" clickable v-close-popup>
                <q-item-section @click="hidePost(id)" v-if="!hide">Hide</q-item-section>
                <q-item-section @click="cancelHidePost(id)" v-else>Cancel Hide</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-item-label>
      <div class="post-content" v-html="content.text"></div>

      <q-img v-if="content && content.image" :src="content.image"  spinner-color="white" class="my-img" />
      <q-video v-if="content &&  content.video" autoplay="false" :src="content.video"  :ratio="16 / 9" class="my-img" />

      <!--       <ShowMap v-if="content.geo && content.geo.coordinates.length != 0"  :myPosition="content.geo.coordinates"
          :style="$q.screen.gt.sm ? 'height: 280px; max-width:  100%' :  'height: 200px; max-width: 100%'" /> -->
      <ShowMap v-if="content.geo && content.geo.coordinates.length != 0" :mapId="_id" :my-position="content.geo.coordinates" />

      <div class="my-buttons q-mt-sm q-ml-sm text-grey-7">
        <!-- TODO:对这几个v-if 的鼠标移动上去有 tooltip 什么时候才满足条件 -->
        <div class="my-button" id="dislike">
          <q-btn flat round :color="hasLiked.disliked ? 'black' : 'grey'" :icon="hasLiked.disliked
            ? 'fa-sharp fa-solid fa-thumbs-down'
            : 'fa-sharp fa-regular fa-thumbs-down'
            " size="sm" id="dislikeBtn" @click.stop.prevent="NegReactionHandler(id)"></q-btn>
          <span> {{ reactiveCnt.negative }}</span>
        </div>
        <div class="my-button" id="like">
          <q-btn id="likeBtn" flat round :color="hasLiked.liked ? 'red' : 'grey'" :icon="hasLiked.liked
            ? 'fa-sharp fa-solid fa-thumbs-up'
            : 'fa-sharp fa-regular fa-thumbs-up'
            " size="sm" @click.stop.prevent="PosReactionHandler(id)">
          </q-btn>
          <span>{{ reactiveCnt.positive }}</span>

        </div>

        <div class="my-button" id="reply" @click.stop>
          <q-btn id="replyBtn" flat round icon="fa-regular fa-comment" size="sm">
            <!-- @click.stop.prevent="showReplies(id)" -->
            <q-popup-proxy
              v-if="!showReply && ifLoggedRouter">
               <WritePost :id="id" :author="author" />
            </q-popup-proxy>
          </q-btn>
          <span v-if="showReply">{{ replies.length}}</span>
        </div>

        <div class="my-button" id="chart">
          <q-btn id="chartBtn" flat round icon="fa-solid fa-chart-simple" size="sm" @click.stop>
          </q-btn>
          <span>{{ meta.impressions }}</span>
        </div>

        <div class="my-button" id="bookmark" v-if="ifLoggedRouter">
          <q-btn id="bookmarkBtn" flat round :icon="hasCollected ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'" size="sm"
            @click.stop.prevent="bookmarkHandler(collected, id)">
          </q-btn>
          <span></span>
        </div>
      </div>
    </q-item-section>

  </q-item>
</template>

<script setup>
import { useRouter } from "vue-router";
import { formatDistance, parseISO } from "date-fns";
import { onMounted, reactive, ref, watch, computed } from "vue";

import { usePostStore } from "src/stores/post";
import { getUserHandle, undoLikePublicPost, undoDislikePublicPost } from "src/common/localStorageHandler";
import ShowMap from 'src/components/map/ShowMap.vue'
import WritePost from "./WritePost.vue";
import { fetchUser } from "src/common/requestsHandler";


const props = defineProps({
  id: {
    type: String,
  },
  _id:{
    type: String
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
    video: {
      type: String,
      default: "",
    },
    geo: {
      type: String,
      default: "Point",
      coordinates: {
        type: Array,
        default: [],
      },
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
  },
  liked: {
    type: Boolean,
    default: false
  },
  disliked: {
    type: Boolean,
    default: false
  },
  replied:{
    type: Boolean,
    default: false
  },
  replies:{
    type: Array,
    default: ()=>[]
  },
  showReply:{
    type: Boolean,
    default: false
  }
});

/******************************************
                    data
 *******************************************/
const { hidePost, cancelHidePost, getReplies,getOfficialReplies, add_posReaction, add_negReaction, undo_posReaction, undo_negReaction, addPositivePublic, addNegativePublic } = usePostStore()
const router = useRouter();

const ifLoggedRouter = router.currentRoute.value.name != "Public"
const reactiveCnt = reactive({
  positive: props.reactions.positive,
  negative: props.reactions.negative
})
const hasLiked = reactive({
  liked: props.liked,
  disliked: props.disliked
})

/******************************************
               functions
 *******************************************/
const {addToBookmark, removeBookmark} = usePostStore()
const gotoAuthor = ((author) => {
  // console.log("goto post's author page");

  router.push({
    name: "UserDetail",
    params: {
      userId: author,
    },
  });
})

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

const hasCollected = ref(props.collected)

const bookmarkHandler = (collected, id) => {
  if (!collected) {
    hasCollected.value = true;
    addToBookmark(id);
  }
  else {
    hasCollected.value =false;
    removeBookmark(id);
  }
};


// const replies = computed(() => getReplies(props.id)) || []

const addPosReaction = async (id) => {
  let data = null;
  if (ifLoggedRouter) {
    data = await add_posReaction(id);
  }
  else {
    data = await addPositivePublic(id);
  }
  // console.log("up status", data)
  if (data == 200) {
    hasLiked.liked = true
    reactiveCnt.positive += 1
  }
}

const undoPosReaction = async (id) => {
  let data = null;
  if (ifLoggedRouter) {
    data = await undo_posReaction(id);
    if (data == 200) {
      hasLiked.liked = false
      reactiveCnt.positive > 0 ? reactiveCnt.positive -= 1 : reactiveCnt.positive
    }
  }
  else {
    undoLikePublicPost(id)
    hasLiked.liked = false
    reactiveCnt.positive > 0 ? reactiveCnt.positive -= 1 : reactiveCnt.positive
  }
}

const addNegReaction = async (id) => {
  let data = null;
  if (ifLoggedRouter) {
    data = await add_negReaction(id);
  }
  else {
    data = await addNegativePublic(id);
  }
  // console.log("down status", data)
  if (data == 200) {
    hasLiked.disliked = true
    reactiveCnt.negative += 1
  }
}

const undoNegReaction = async (id) => {
  let data = null;
  if (ifLoggedRouter) {
    data = await undo_negReaction(id);
    if (data == 200) {
      hasLiked.disliked = false
      reactiveCnt.negative > 0 ? reactiveCnt.negative -= 1 : reactiveCnt.negative
    }
  }
  else {
    undoDislikePublicPost(id)
    hasLiked.disliked = false
    reactiveCnt.negative > 0 ? reactiveCnt.negative -= 1 : reactiveCnt.negative
  }
}
function PosReactionHandler(id) {
  if (hasLiked.liked) {
    undoPosReaction(id)
  }
  else {
    addPosReaction(id)
  }
}

function NegReactionHandler(id) {
  if (hasLiked.disliked) {
    undoNegReaction(id)
  }
  else {
    addNegReaction(id)
  }
}

const showReplies = (id) => { alert("查看回复！") };


const userDetails = reactive({
  verified: false,
  admin: false,
  accountType: "user"
})
onMounted(async () => {
  // console.log("userDetails 查找用户传递的 handle 参数为： ", paramId)
  if(ifLoggedRouter){
    try{
      const data = await fetchUser(props.author)
      userDetails.verified = data.verified
      userDetails.accountType = data.accountType
    }
    catch(err){
      console.log("【ShowPost】fetchUser to get verified state failed, please see console for more informations!")
    }
  }
})


</script>

<style lang="sass" scoped>
.rounded-rectangle
  border-radius: 10px
  display: inline-block
  background-color: #00a1f2
  padding: 0.3rem

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
    #bookmarkBtn
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
