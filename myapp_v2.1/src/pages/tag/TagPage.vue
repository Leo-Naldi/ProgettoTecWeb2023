<template>
  <q-page padding role="main">
    <div class="text-h3 text-center q-pt-xl" aria-level="1">{{ `#${tagDetails.tagName}` }}</div>
    <div class="text-h6 text-center text-primary q-pt-xl">
      {{ `There're ${tagDetails.tagRes.length} related results for "${routerParam.tagName}".` }}
    </div>
    <div class="text-h6 text-center text-secondary q-pa-xl">
      {{ `Click ` }}
      <router-link :to="{ name: 'KeywordsMap', params: { keywords: routerParam.tagName }}" role="link">
        here
      </router-link>
      {{ ` to see them on the map.` }}
    </div>
    <q-separator class="divider" color="grey-2" size="1px" role="separator" />
    <q-list role="list">
      <ShowPost v-for="post in tagDetails.tagRes" :key="post._id" v-bind="post" clickable />
    </q-list>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import { usePostStore } from "src/stores/post";
import ShowPost from "src/components/posts/ShowPost.vue";

const postStore= usePostStore()
const router= useRouter()

const routerParam = router.currentRoute.value.params
const tagDetails = reactive({
  tagName: routerParam.tagName,
  tagRes: []
})

const fetchTags = async (tagName) => {
  tagDetails.tagName = tagName
  tagDetails.tagRes = await postStore.searchHashtags(tagName)
  console.log("and the results are: ", tagDetails.tagRes)
}

watch(
  () => router.currentRoute.value.params,
  async (v) => {
    if (v.tagName) {
      await fetchTags(v.tagName)
    }
  },
  {
    immediate: true,
  }

);

onMounted(async () => {
  const paramId = routerParam.tagName;
  await fetchTags(paramId)

  console.log("now you're searching for words: ", routerParam)
})
</script>
