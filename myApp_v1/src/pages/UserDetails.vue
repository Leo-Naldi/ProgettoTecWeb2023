<template>
  <q-page>
    <div class="column" style="height: 35rem">
      <div class="col bg-blue-grey-11">
        <q-img
          src="https://images.unsplash.com/photo-1696219852009-3d231b68538a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw0fHx8ZW58MHx8fHx8&auto=format&fit=crop&w=900&q=60"
          alt="cover_img" style="max-width: 100%; height: 100%;"></q-img>
        <div class="avatar">
          <q-avatar size="9rem" color="blue-6" text-color="white">
            <img src="https://cdn.quasar.dev/img/avatar2.jpg" />
            <!-- {{ paramId[0] }} -->
          </q-avatar>
        </div>
      </div>
      <q-separator size="0.25rem" color="grey-2" class="divider" />
      <div class="col q-pa-lg">
        <div class="flex justify-end">
          <q-btn outline rounded style="color: goldenrod" icon="edit" label="Edit profile" @click="editProfile()" />
        </div>
        <div class="q-mt-md">
          <q-item-label class="text-subtitle1 flex justify-between">
            <div class="text-bold">{{  userDetails.userName }}</div>
            <span class="text-grey-7 text-caption"><q-icon name="calendar_month" size="xs" class="q-mr-sm" />Joined
              at {{ userDetails.created }}</span>
          </q-item-label>
          <q-item-label class="text-body2">
            <span class="text-grey-7">@{{ userDetails.handle }}</span>
          </q-item-label>
          <q-item-label>
            <span class="text-grey-7 text-caption">Hi guys! I am {{ userDetails.userName }} and nice to meet u! </span>
          </q-item-label>
          <q-item-label class="text-subtitle1 flex">
            <strong>{{ userDetails.joined_channels.length }}
              <span class="text-grey-7 text-caption q-mr-md">Followed channels</span></strong>
            <strong>{{ userDetails.co_edited_channels.length }}
              <span class="text-grey-7 text-caption q-mr-md">Co-editor channels</span></strong>
          </q-item-label>
        </div>
        <q-item-label class="nav-option text-subtitle1 flex justify-around q-py-md q-mt-lg">
          <strong @click="onActive('posts')" :style="[
            isActive === 'posts'
              ? { borderBottom: '2px solid #1da1f2' }
              : { borderBottom: '2px solid transparent' },
          ]"><q-btn flat round color="grey" icon="reply_all" size="sm" />Posts</strong>
          <strong @click="onActive('replies')" :style="[
            isActive === 'replies'
              ? { borderBottom: '2px solid #1da1f2' }
              : { borderBottom: '2px solid transparent' },
          ]"><q-btn flat round color="grey" icon="question_answer" size="sm" />Replies</strong>
          <strong @click="onActive('media')" :style="[
            isActive === 'media'
              ? { borderBottom: '2px solid #1da1f2' }
              : { borderBottom: '2px solid transparent' },
          ]"><q-btn flat round color="grey" icon="movie" size="sm" />Media</strong>
          <strong @click="onActive('likes')" :style="[
            isActive === 'likes'
              ? { borderBottom: '2px solid #1da1f2' }
              : { borderBottom: '2px solid transparent' },
          ]"><q-btn flat round color="grey" icon="thumb_up" size="sm" />Likes</strong>
        </q-item-label>
      </div>
    </div>
    <q-separator size="0.1rem" color="grey-1" style="margin-top:-2rem" />

    <div>
      <q-list v-if="isActive === 'posts'" separator>
        <ShowPost v-for="post in userMessageDetails.userPosts" :key="post.id" v-bind="post"
          class="q-py-md" clickable/>
      </q-list>
      <q-list v-if="isActive === 'replies'" separator>
        <ShowPost v-for="post in userMessageDetails.userReplies" :key="post.id" v-bind="post"
          class=" q-py-md" clickable />
      </q-list>
      <q-list v-if="isActive === 'media'" separator>
        <ShowPost v-for="post in userMessageDetails.userMedias" :key="post.id" v-bind="post"
          class="q-py-md" clickable/>
      </q-list>
      <q-list v-if="isActive === 'likes'" separator>
        <ShowPost v-for="post in userMessageDetails.userAgrees" :key="post.id" v-bind="post" class="q-py-md" clickable/>
          <!-- {{ userDetails.liked }} -->
        <p style="display:flex;align-items: center; justify-content:center" v-if="userMessageDetails.userAgrees.length<=0">No user Likes!</p>
      </q-list>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import ShowPost from "src/components/posts/ShowPost.vue";
import { usePostStore } from "src/stores/posts";
import { useUserStore } from "src/stores/user";
import { format } from "date-fns";

const router = useRouter();

const postStore = usePostStore()
const userStore = useUserStore()





const isActive = ref("posts");

const onActive = (nameLink) => {
  isActive.value = nameLink;
};

const userDetails = reactive({
  userName: null,
  handle: null,
  description: "Hi~",
  joined_channels: 0,
  co_edited_channels: 0,
  created: NaN,
  liked: null
})


const userMessageDetails = reactive({
  userPosts: null,
  userReplies: null,
  userMedias: null,
  userAgrees: null
})

const fetchUserMessages = async (paramId) => {
  userMessageDetails.userPosts = await postStore.fetchUserPosts(paramId)
}


const fetchUserData = async (paramId) => {
  const data = await userStore.searchUser(paramId)
  userDetails.handle=data.handle
  userDetails.userName=data.username
  userDetails.joined_channels=data.joinedChannels
  userDetails.co_edited_channels=data.editorChannels
  userDetails.liked=data.liked
  userMessageDetails.userAgrees= await postStore.fetchLikes(data.liked)
  userDetails.created = format(new Date(data.meta.created), 'MMMM yyyy');
  return data
}

watch(
  () => router.currentRoute.value.params,
  async (v) => {
    if(v.userId){
    fetchUserMessages(v.userId);
    fetchUserData(v.userId)
    }
  },
  {
    deep: false,
    immediate: true,
  }
);





onMounted(() => {
  const paramId = router.currentRoute.value.params.userId;
  if (typeof paramId !== 'undefined') {
    console.log("now you're searching informations for user: ", paramId)
    fetchUserMessages(paramId)
    fetchUserData(paramId)
  }
})
</script>

<style lang="sass" scoped>
.avatar
  position: absolute
  top: 1.8%
  left: 5%
  z-index: 99
  border: 0.2rem solid #1DA1F2
  border-radius: 50%
  transform: translateY(100%)


strong
  cursor: pointer

.column
  position: relative
</style>
