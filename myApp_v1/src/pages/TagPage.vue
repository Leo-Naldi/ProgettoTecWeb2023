<template>
  <q-page padding>
    <div class="text-h3 text-center q-pt-xl">{{ paramId }}</div>
    <div class="text-h6 text-center text-primary q-pa-xl">There're {{ tag_res.length }} related results for "{{ paramId }}".</div>
    <q-separator class="divider" color="grey-2" size="1px" />
    <q-list>
      <ShowPost v-for="post in  tag_res" :key="post._id" v-bind="post" clickable />
    </q-list>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import { usePostStore } from "src/stores/posts";
import ShowPost from "src/components/posts/ShowPost.vue";

const postStore= usePostStore()
const router= useRouter()

const paramId = router.currentRoute.value.params.tagName
const tag_res = ref([])

const fetchTags = async (tagName) => {
  tag_res.value = await postStore.searchHashtags(tagName)
  console.log("and the results are: ", tag_res.value)

}

onMounted(async () => {
  const paramId = router.currentRoute.value.params.tagName;
  fetchTags(paramId)

  console.log("now you're searching for words: ", paramId)
})
</script>
