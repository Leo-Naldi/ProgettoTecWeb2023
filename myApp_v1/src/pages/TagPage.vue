<template>
  <q-page padding>
    <div class="text-h3 text-center q-pa-xl">#Tag</div>
    <q-separator class="divider" color="grey-2" size="1px" />

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import { usePostStore } from "src/stores/posts";

const postStore= usePostStore()
const router= useRouter()

const tag_res = ref([])

onMounted(async () => {
  const paramId = router.currentRoute.value.params.tagName;
  tag_res.value = await postStore.searchHashtags(paramId)

  console.log("now you're searching for words: ", paramId)
  console.log("and the results are: ", tag_res.value)
})
</script>
