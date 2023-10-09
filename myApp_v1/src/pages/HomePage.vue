<template>
  <q-page padding>
    <!-- content -->
    Home
    <br>
    <ChannelButton channel_name="daily_news" />
    {{ all_posts }}
  </q-page>
</template>

<script setup>
import ChannelButton from 'src/components/ChannelButton.vue';
import { usePostStore } from 'src/stores/posts.js';
import { ref, onMounted, computed, } from "vue";

const postStore = usePostStore()

const all_posts = computed(() => postStore.getPosts[0])

</script>
