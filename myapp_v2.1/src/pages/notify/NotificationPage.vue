<template>
  <q-page>
    <q-item-label class="text-subtitle1 flex justify-around">
      <strong @click="onActive('messages')" :style="[
        isActive === 'messages'
          ? { borderBottom: '3px solid #1da1f2' }
          : { borderBottom: '2px solid transparent' },
      ]" class="q-pb-sm q-pt-xl cursor-pointer"><q-btn flat round color="grey" icon="question_answer"
          size="sm" />Messages</strong>
      <strong @click="onActive('replies')" :style="[
        isActive === 'replies'
          ? { borderBottom: '3px solid #1da1f2' }
          : { borderBottom: '2px solid transparent' },
      ]" class="q-pb-sm q-pt-xl cursor-pointer"><q-btn flat round color="grey" icon="reviews"
          size="sm" />Replies</strong>
      <strong @click="onActive('reactions')" :style="[
        isActive === 'reactions'
          ? { borderBottom: '3px solid #1da1f2' }
          : { borderBottom: '2px solid transparent' },
      ]" class="q-pb-sm q-pt-xl cursor-pointer"><q-btn flat round color="grey" icon="thumb_up"
          size="sm" />Reactions</strong>
    </q-item-label>
    <q-separator />
    <div v-if="isActive === 'messages'">
      <q-list separator v-if="unread_messages.length>0">
        <NotifyEnum :clickHandler="closeMsg.bind(post.id)" :icon="'star'" v-for="post in unread_messages" :key="post._id" v-bind="post" clickable @click="gotoMsgDetails(post.id)"/>
      </q-list>
      <p v-else>"No new message!"</p>
    </div>
    <div v-if="isActive === 'replies'">
      <q-list separator  v-if="unread_replies.length>0">
        <NotifyEnum :clickHandler="closeRe.bind(post.id)" :icon="'comment'" v-for="post in unread_replies" :key="post._id" v-bind="post" clickable @click="gotoReDetails(post.id)"/>
      </q-list>
      <p v-else>"No new reply!"</p>
    </div>
    <div v-if="isActive === 'reactions'">
      <q-list separator  v-if="unread_reactions.length>0">
        <NotifyEnum :clickHandler="closeReactions.bind(post.id)" :icon="'thumb_up'" v-for="post in unread_reactions" :key="post._id" v-bind="post" clickable @click="gotoReactionDetails(post.id)"/>
      </q-list>
      <p v-else>"No new reaction!"</p>
    </div>
  </q-page>
</template>

<script setup>
import { useNotificationsStore } from 'src/stores/notification';
import { useGlobalStore } from 'src/stores/global';
import { computed,ref  } from 'vue';
import { useRouter } from "vue-router";
import NotifyEnum from 'src/components/notify/NotifyEnum.vue';

/**********************************
 *              common
 * ********************************/
const notificationStore = useNotificationsStore()
const globalStore = useGlobalStore()
const router = useRouter();

const unread_messages = computed(()=>notificationStore.getUnreadMessage)
const unread_replies = computed(()=>notificationStore.getUnreadReply)
const unread_reactions = computed(()=>notificationStore.getUnreadReaction)

/**********************************
 *              CSS
 * ********************************/
const isActive = ref("messages");
const onActive = (nameLink) => {
  isActive.value = nameLink;
};

/**********************************
 *              function
 * ********************************/
 const gotoDetails =(postID)=>{
  router.push({
    name: "PostDetail",
    params: {
      postId: postID,
    },
  });
}
const closeMsg = (e) => {
  let index = unread_messages.value.findIndex((post) => post.id === e);
  notificationStore.remove_m_unread(index)
  globalStore.decreaseUnread()
};
const gotoMsgDetails = (e) => {
  closeMsg(e);
  gotoDetails(e)
};
const closeRe = (e) => {
  let index = unread_replies.value.findIndex((post) => post.id === e);
  notificationStore.remove_c_unread(index)
  globalStore.decreaseUnread()
};
const gotoReDetails = (e) => {
  closeRe(e);
  gotoDetails(e)
};
const closeReactions = (e) => {
  let index = unread_reactions.value.findIndex((post) => post.id === e);
  notificationStore.remove_r_unread(index)
  globalStore.decreaseUnread()
};
const gotoReactionDetails = (e) => {
  closeReactions(e);
  gotoDetails(e)
};

</script>
