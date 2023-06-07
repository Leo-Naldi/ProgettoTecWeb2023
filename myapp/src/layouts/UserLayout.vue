<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-scroll-area
        :thumb-style="thumbStyle"
        :content-style="contentStyle"
        :content-active-style="contentActiveStyle"
        style="height: 40rem; max-width: 100%"
      >
        <div class="column relative" style="height: 35rem">
          <div class="col bg-blue-grey-11">
            <!-- <q-img src="" style="max-width: 100%; height: 100%;"></q-img> -->
            <div class="avatar">
              <q-avatar size="11rem" class="">
                <img
                  src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=80"
                />
              </q-avatar>
            </div>
          </div>
          <q-separator size="0.25rem" color="grey-2" class="divider" />
          <div class="col q-pa-lg">
            <div class="flex justify-end">
              <q-btn
                outline
                rounded
                style="color: goldenrod"
                icon="edit"
                label="Edit profile"
                @click="editProfile"
              />
            </div>
            <div class="q-mt-xl">
              <q-item-label class="text-subtitle1 flex justify-between">
                <strong>store.getUser.username</strong>
                <span class="text-grey-7 text-caption"
                  ><q-icon
                    name="calendar_month"
                    size="xs"
                    class="q-mr-sm"
                  />Join at joinedDate
                </span>
              </q-item-label>
              <q-item-label class="text-body2">
                <span class="text-grey-7">@store.getUser.handle</span>
              </q-item-label>
              <q-item-label>
                <span class="text-grey-7 text-caption"
                  >Maybe a description???</span
                >
              </q-item-label>
              <q-item-label class="text-subtitle1 flex">
                <strong>
                  joinedChannels
                  <span class="text-grey-7 text-caption q-mr-md"
                    >Following</span
                  ></strong
                >
                <strong
                  >createdChannels
                  <span class="text-grey-7 text-caption">Created</span></strong
                >
                <!-- TODO: Maybe show the total number of likes/steps, or total number of controversial posts/popular posts? -->
              </q-item-label>
            </div>
            <q-item-label
              class="nav-option text-subtitle1 flex justify-around q-py-lg"
            >
              <!--           <strong @click="onActive('tweets')" :style="[isActive === 'tweets' ? {borderBottom : '2px solid #1da1f2'} : {borderBottom : '2px solid transparent'}]"><q-btn flat round color="grey" icon="reply_all" size="sm" />Tweets</strong>
          <strong @click="onActive('replies')" :style="[isActive === 'replies' ? {borderBottom : '2px solid #1da1f2'} : {borderBottom : '2px solid transparent'}]"><q-btn flat round color="grey" icon="question_answer" size="sm" />Replies</strong>
          <strong @click="onActive('media')" :style="[isActive === 'media' ? {borderBottom : '2px solid #1da1f2'} : {borderBottom : '2px solid transparent'}]"><q-btn flat round color="grey" icon="movie" size="sm" />Media</strong>
          <strong @click="onActive('likes')" :style="[isActive === 'likes' ? {borderBottom : '2px solid #1da1f2'} : {borderBottom : '2px solid transparent'}]"><q-btn flat round color="grey" icon="thumb_up" size="sm" />Likes</strong>
  -->
            </q-item-label>
          </div>
        </div>
        <div>
          <!--       <Tweets v-if="isActive === 'tweets'" />
      <Replies v-if="isActive === 'replies'" />
      <Media v-if="isActive === 'media'" />
      <Likes v-if="isActive === 'likes'" /> -->
        </div>
      </q-scroll-area>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";
/* import Tweets from "./profile/Tweets.vue"
import Replies from "./profile/Replies.vue"
import Media from "./profile/Media.vue"
import Likes from "./profile/Likes.vue" */

const isActive = ref("tweets");

const onActive = (nameLink) => {
  isActive.value = nameLink;
};

const contentStyle = {
  color: "#555",
};

const contentActiveStyle = {
  color: "black",
};

const thumbStyle = {
  right: "0px",
  borderRadius: "5px",
  backgroundColor: "#027be3",
  width: "3px",
  opacity: 0.7,
};
</script>
