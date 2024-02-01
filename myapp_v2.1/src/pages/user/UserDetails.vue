<template>
  <q-page role="region" aria-label="User Profile">
    <div class="column" style="height: 35rem">
      <div class="col bg-blue-grey-11">
        <q-img
          src="https://images.unsplash.com/photo-1696219852009-3d231b68538a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw0fHx8ZW58MHx8fHx8&auto=format&fit=crop&w=900&q=60"
          alt="cover_img" style="max-width: 100%; height: 100%;"
          role="img"
          aria-label="Cover Image"
        ></q-img>
        <div class="avatar">
          <q-avatar size="9rem" color="blue-6" text-color="white" role="img" aria-label="User Avatar">
            <img src="https://cdn.quasar.dev/img/avatar2.jpg" alt="user_avatar" />
            <div v-if="userDetails.verified" role="img" aria-label="Verified Badge">
              <q-icon name="fa-solid fa-circle-check" class="verified" size="3.5rem" />
            </div>
          </q-avatar>
        </div>
      </div>
      <q-separator size="0.25rem" color="grey-2" class="divider" role="separator" aria-label="Content Separator" />
      <div class="col q-pa-lg">
        <br aria-hidden="true">
        <br aria-hidden="true">
        <!-- User Details Section -->
        <div class="q-mt-md">
          <!-- User Name, Handle, Description, Joined Channels, Co-edited Channels -->
          <q-item-label class="text-subtitle1 flex justify-between">
            <div class="text-bold">{{ userDetails.userName }}</div>
            <span class="text-grey-7 text-caption">
              <q-icon name="calendar_month" size="xs" class="q-mr-sm" />
              Joined at {{ userDetails.created }}
            </span>
          </q-item-label>
          <q-item-label class="text-body2">
            <span class="text-grey-7">@{{ userDetails.handle }}</span>
          </q-item-label>
          <q-item-label>
            <span class="text-grey-7 text-caption">{{ userDetails.description || 'Hi guys! Nice to meet you!' }}</span>
          </q-item-label>
          <q-item-label class="text-subtitle1 flex">
            <strong>{{ userDetails.joined_channels.length }}
              <span class="text-grey-7 text-caption q-mr-md">Followed channels</span></strong>
            <strong>{{ userDetails.co_edited_channels.length }}
              <span class="text-grey-7 text-caption q-mr-md">Co-editor channels</span></strong>
          </q-item-label>
        </div>
        <!-- User Navigation Options -->
        <q-item-label role="tabpanel" class="nav-option text-subtitle1 flex justify-around q-py-md q-mt-lg">
          <strong role="tab" aria-selected="true" @click="onActive('posts')" :style="[
            isActive === 'posts'
              ? { borderBottom: '2px solid #1da1f2' }
              : { borderBottom: '2px solid transparent' },
          ]">
            <q-btn flat round color="grey" icon="reply_all" size="sm" />Posts
          </strong>
          <strong role="tab" aria-selected="false" @click="onActive('replies')" :style="[
            isActive === 'replies'
              ? { borderBottom: '2px solid #1da1f2' }
              : { borderBottom: '2px solid transparent' },
          ]">
            <q-btn flat round color="grey" icon="question_answer" size="sm" />Replies
          </strong>
          <strong role="tab" aria-selected="false" @click="onActive('media')" :style="[
            isActive === 'media'
              ? { borderBottom: '2px solid #1da1f2' }
              : { borderBottom: '2px solid transparent' },
          ]">
            <q-btn flat round color="grey" icon="movie" size="sm" />Media
          </strong>
          <strong role="tab" aria-selected="false" @click="onActive('likes')" :style="[
            isActive === 'likes'
              ? { borderBottom: '2px solid #1da1f2' }
              : { borderBottom: '2px solid transparent' },
          ]">
            <q-btn flat round color="grey" icon="thumb_up" size="sm" />Likes
          </strong>
        </q-item-label>
      </div>
    </div>
    <q-separator size="0.1rem" color="grey-1" style="margin-top: -2rem" role="separator" aria-label="Content Separator" />

    <!-- User Posts, Replies, Media, Likes Sections -->
    <div>
      <q-list v-if="isActive === 'posts'" separator role="list" aria-live="polite" aria-label="User Posts">
        <ShowPost v-for="post in userMessageDetails.userPosts" :key="post.id" v-bind="post"
          class="q-py-md" clickable role="listitem" aria-label="User Post"
        />
        <p v-if="userMessageDetails.userPosts.length <= 0" role="status" aria-live="assertive">
          No user Posts!
        </p>
      </q-list>

      <q-list v-if="isActive === 'replies'" separator role="list" aria-live="polite" aria-label="User Replies">
        <ShowPost v-for="post in userMessageDetails.userReplies" :key="post.id" v-bind="post" :canModify="true"
          class=" q-py-md" clickable role="listitem" aria-label="User Reply"
        />
        <p class="flex-center" v-if="userMessageDetails.userReplies.length <= 0" role="status" aria-live="assertive">
          No user Replies!
        </p>
      </q-list>

      <q-list v-if="isActive === 'media'" separator role="list" aria-live="polite" aria-label="User Media">
        <ShowPost :canModify="true" v-for="post in userMessageDetails.userMedias" :key="post.id" v-bind="post"
          class="q-py-md" clickable role="listitem" aria-label="User Media"
        />
        <p class="flex-center" v-if="userMessageDetails.userMedias.length <= 0" role="status" aria-live="assertive">
          No user Medias!
        </p>
      </q-list>

      <q-list v-if="isActive === 'likes'" separator role="list" aria-live="polite" aria-label="User Likes">
        <ShowPost v-for="post in userMessageDetails.userAgrees" :key="post.id" v-bind="post" class="q-py-md" clickable
          role="listitem" aria-label="User Like"
        />
        <p class="flex-center" v-if="userMessageDetails.userAgrees.length <= 0" role="status" aria-live="assertive">
          No user Likes!
        </p>
      </q-list>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import ShowPost from "src/components/posts/ShowPost.vue";
import { usePostStore } from "src/stores/post";
import { useUserStore } from 'src/stores/user';

import { fetchUser, fetchUserLiked } from "src/common/requestsHandler";
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
  verified: false,
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
  userMessageDetails.userMedias = computed(() => userMessageDetails.userPosts.filter(obj => obj.content !== undefined && obj.content.image != undefined))
  userMessageDetails.userReplies = computed(() => userMessageDetails.userPosts.filter(obj => obj.answering !== undefined))

}

const fetchUserData = async (paramId) => {
  const data = await fetchUser(paramId)
  userDetails.handle = data.handle
  userDetails.userName = data.username
  userDetails.verified = data.verified
  userDetails.description = data.description
  userDetails.joined_channels = data.joinedChannels
  userDetails.co_edited_channels = data.editorChannels
  userDetails.liked = data.liked


  userMessageDetails.userAgrees = await fetchUserLiked(paramId)
  userDetails.created = format(new Date(data.meta.created), 'MMMM yyyy');
  return data
}



watch(
  () => router.currentRoute.value.params,
  async (v) => {
    if (v.userId) {
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
    // console.log("now you're searching informations for user: ", paramId)
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
