<template>
  <q-page>
    <q-scroll-area
      :thumb-style="thumbStyle"
      :content-style="contentStyle"
      :content-active-style="contentActiveStyle"
      style="height: 40rem; max-width: 100%"
    >
      <div class="column relative" style="height: 35rem">
        <div class="col bg-blue-grey-11">
          <!-- <q-img src="/img/github_preview.png" style="max-width: 100%; height: 100%;"></q-img> -->
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
              <strong>{{ store.getUser.username }}</strong>
              <span class="text-grey-7 text-caption"
                ><q-icon name="calendar_month" size="xs" class="q-mr-sm" />Join
                at {{ joinedDate }}
              </span>
            </q-item-label>
            <q-item-label class="text-body2">
              <span class="text-grey-7">@{{ store.getUser.handle }}</span>
            </q-item-label>
            <q-item-label>
              <span class="text-grey-7 text-caption"
                >Maybe a description???</span
              >
            </q-item-label>
            <q-item-label class="text-subtitle1 flex">
              <strong
                >{{ joinedChannels }}
                <span class="text-grey-7 text-caption q-mr-md"
                  >Joined</span
                ></strong
              >
              <strong
                >{{ createdChannels }}
                <span class="text-grey-7 text-caption">Created</span></strong
              >
              <!-- TODO: Maybe show the total number of likes/steps, or total number of controversial posts/popular posts? -->
            </q-item-label>
          </div>
          <q-item-label
            class="nav-option text-subtitle1 flex justify-around q-py-lg"
          >
            <strong
              @click="onActive('tweets')"
              :style="[
                isActive === 'tweets'
                  ? { borderBottom: '2px solid #1da1f2' }
                  : { borderBottom: '2px solid transparent' },
              ]"
              ><q-btn
                flat
                round
                color="grey"
                icon="reply_all"
                size="sm"
              />Posts</strong
            >
            <strong
              @click="onActive('media')"
              :style="[
                isActive === 'media'
                  ? { borderBottom: '2px solid #1da1f2' }
                  : { borderBottom: '2px solid transparent' },
              ]"
              ><q-btn
                flat
                round
                color="grey"
                icon="movie"
                size="sm"
              />Media</strong
            >
            <strong
              @click="onActive('likes')"
              :style="[
                isActive === 'likes'
                  ? { borderBottom: '2px solid #1da1f2' }
                  : { borderBottom: '2px solid transparent' },
              ]"
              ><q-btn
                flat
                round
                color="grey"
                icon="thumb_up"
                size="sm"
              />Likes</strong
            >
            <strong
              @click="onActive('dislikes')"
              :style="[
                isActive === 'dislikes'
                  ? { borderBottom: '2px solid #1da1f2' }
                  : { borderBottom: '2px solid transparent' },
              ]"
              ><q-btn
                flat
                round
                color="grey"
                icon="thumb_down"
                size="sm"
              />Dislikes</strong
            >
          </q-item-label>
        </div>
      </div>
      <div>
        <UserPosts v-if="isActive === 'tweets'" />
        <UserMedias v-if="isActive === 'media'" />
        <UserLike v-if="isActive === 'likes'" />
        <UserDisLike v-if="isActive === 'dislikes'" />
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script setup>
import { ref } from "vue";

import UserPosts from "../components/UserPosts.vue";
import UserMedias from "src/components/UserMedias.vue";
import UserLike from "src/components/UserLike.vue";
import UserDisLike from "src/components/UserDisLike.vue";

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

<script>
import { useUserStore } from "stores/user";
import { api } from "boot/axios";

export default {
  data() {
    return {
      store: useUserStore(),
      joinedDate: "",
      joinedChannels: 0,
      createdChannels: 0,
    };
  },
  methods: {
    gotoPage() {
      this.$router.push("/channel");
    },
    editProfile() {
      //TODO:Or change the user's personal information on other pages
      console.log("you want to edit yourProfile");
    },
  },
  mounted() {
    this.joinedDate = this.store.getUser.meta.created.substring(0, 10);
    this.joinedChannels = this.store.getUser.joinedChannels.length;

    var getToken = this.store.getUserToken;
    var getUser = this.store.getUser.handle;

    api.defaults.headers.common["Authorization"] = "Bearer " + getToken;
    api
      .get("channels/")
      .then((response) => {
        if (response.status === 200) {
          this.createdChannels = response.data.length;
        }
      })
      .catch((err) => {
        console.log(err);
      });

    api
      .get("users/" + getUser)
      .then((response) => {
        if (response.status === 200) {
          this.joinedChannels = response.data.joinedChannels.length;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },
};
</script>

<style lang="scss" scoped>
.avatar {
  position: absolute;
  top: 20%;
  left: 5%;
  z-index: 99;
  border: 0.2rem solid #1da1f2;
  border-radius: 50%;
}
.nav-option > strong {
  cursor: pointer;
}
</style>
