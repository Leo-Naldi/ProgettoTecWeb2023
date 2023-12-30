<template>
  <div class="trend-container bg-grey-2" style="max-width: full">
    <div class="flex justify-between items-center q-px-md q-py-sm">
      <p class="text-weight-bold text-h6" style="margin-bottom: -0.2rem">Trends for you</p>
      <!-- <q-icon name="settings" size="xs" class="cursor-pointer" /> -->
    </div>
    <q-list>
      <q-item v-for="(trend, i) in trendList.slice(0,3)" :key="i" class="cursor-pointer">
        <trend-component :tag="trend.tag" :tweet="trend.tweet"></trend-component>
<!--         <q-item-section>
          <q-item-label caption>Trending in {{ trend.country }}</q-item-label>
          <q-item-label class="text-weight-medium"><a href="/">{{
            trend.tag
          }}</a></q-item-label>
          <q-item-label caption>{{ trend.tweet }} Tweets</q-item-label>
        </q-item-section>

        <q-item-section side top>
          <q-item-label caption><q-btn flat round  color="grey-5" icon="more_horiz"
              @click="isHide(trend.tag)" /></q-item-label>
        </q-item-section> -->
      </q-item>

    </q-list>
    <div ><p class="text-weight-bold text-center q-pa-sm cursor-pointer text-primary" @click="showMoreHandler()">Show more</p></div>

  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import trendComponent from "./trendComponent.vue";
import { useRouter } from "vue-router";

const props = defineProps({
  trendList: {
    type: Array,
    required: true,
  },
})

const router= useRouter()
function showMoreHandler() {
      router.push({
        name: "disploreHashtag",
      });
    }

</script>

<style lang="scss" scoped>
.trend-container {
  border-radius: 1rem;
}
</style>
