<template>
  <div role="region" aria-label="Audio Player">
    <audio ref="audio" id="audio" aria-label="Audio Player">
      <source type="audio/mpeg" />
    </audio>
  </div>
</template>

<script>
import { useNotificationsStore } from "src/stores/notification";
import { useQuasar } from "quasar";
import { useGlobalStore } from "src/stores/global";

export default {
  name: "NotifyType",
  setup() {
    const $q = useQuasar();
    const notifyStore = useNotificationsStore();
    const globalStore = useGlobalStore()

    return {
      show_notifications(sound) {
        var audio = document.getElementById("audio");

        audio.src = sound;
        audio.play();

        $q.notify({
          group: "my-group",
          message: "You have " + notifyStore.getUnread + " unread notifies.",
          color: "primary",
          avatar: "https://cdn.quasar.dev/img/avatar2.jpg",
          actions: [
            {
              label: "Watch",
              color: "yellow",
              handler: () => {
                this.$router.push("/notifications");
              },
            },
            {
              label: "Dismiss",
              color: "white",
              handler: () => {
                notifyStore.reset_all();
                console.log("after reseted", notifyStore.getUnread);
              },
            },
          ],
        });
      },
      show_notifications_message(sound, postId) {
        var audio = document.getElementById("audio");
        audio.src = sound;
        audio.play();
        $q.notify({
          group: "my-group",
          message: "you just got a new message!",
          color: "primary",
          avatar: "https://cdn.quasar.dev/img/avatar2.jpg",
          actions: [
            {
              label: "Watch",
              color: "yellow",
              handler: () => {
                this.$router.push({
                  name: "PostDetail",
                  params: {
                    postId: postId,
                  },
                });
              },
            },
            {
              label: "Dismiss",
              color: "white",
              handler: () => {
                notifyStore.remove_m_unread(postId);
                globalStore.decreaseUnread()
                console.log("after reseted", notifyStore.getUnreadMessage);
              },
            },
          ],
        });
      },
      show_notifications_ReMsg(sound,yourPostId,  postId) {
        var audio = document.getElementById("audio");
        audio.src = sound;
        audio.play();
        $q.notify({
          group: "my-group",
          message: "you just got a private reply!",
          color: "primary",
          avatar: "https://cdn.quasar.dev/img/avatar2.jpg",
          actions: [
            {
              label: "seeReply",
              color: "yellow",
              handler: () => {
                this.$router.push({
                  name: "PostDetail",
                  params: {
                    postId: postId,
                  },
                });
              },
            },
            {
              label: "seeYourPost",
              color: "yellow",
              handler: () => {
                this.$router.push({
                  name: "PostDetail",
                  params: {
                    postId:  yourPostId,
                  },
                });
              },
            },
            {
              label: "Dismiss",
              color: "white",
              handler: () => {
                notifyStore.remove_c_unread(postId);
                notifyStore.decreaseUnread()
                console.log("after reseted", notifyStore.getUnreadMessage);
              },
            },
          ],
        });
      },
      show_notifications_reaction(sound, postId) {
        var audio = document.getElementById("audio");

        audio.src = sound;
        audio.play();
        $q.notify({
          group: "my-group",
          message: "your messages " + postId + " just got a new reactions!",
          color: "primary",
          avatar: "https://cdn.quasar.dev/img/avatar2.jpg",
          actions: [
            {
              label: "Watch",
              color: "yellow",
              handler: () => {
                this.$router.push({
                  name: "PostDetail",
                  params: {
                    postId: postId,
                  },
                });
              },
            },
            {
              label: "Dismiss",
              color: "white",
              handler: () => {
                notifyStore.remove_r_unread(postId);
                globalStore.decreaseUnread()
                console.log("after reseted", notifyStore.getUnreadReaction);
              },
            },
          ],
        });
      },
      show_notifications_reply(sound, postId) {
        var audio = document.getElementById("audio");
        audio.src = sound;
        audio.play();
        $q.notify({
          group: "my-group",
          message: "your messages " + postId + " just got a new reply!",
          color: "primary",
          avatar: "https://cdn.quasar.dev/img/avatar2.jpg",
          actions: [
            {
              label: "Watch",
              color: "yellow",
              handler: () => {
                this.$router.push({
                  name: "PostDetail",
                  params: {
                    postId: postId,
                  },
                });
              },
            },
            {
              label: "Dismiss",
              color: "white",
              handler: () => {
                notifyStore.remove_r_unread(postId);
                globalStore.decreaseUnread()
                console.log("after reseted", notifyStore.getUnreadReply);
              },
            },
          ],
        });
      },
    };
  },
};
</script>
