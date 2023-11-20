<template>
  <div class="trend-container bg-grey-2" style="max-width: full">
    <div class="flex justify-between items-center q-px-md q-py-sm">
      <p class="text-weight-bold text-h6" style="margin-bottom: -0.2rem">Trends for you</p>
      <!-- <q-icon name="settings" size="xs" class="cursor-pointer" /> -->
    </div>
    <q-list>
      <q-item v-for="(trend, i) in trendList" :key="i" class="cursor-pointer">
        <trendComponent :tag="trend.tag" :tweet="trend.tweet"></trendComponent>
      </q-item>

    </q-list>

  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import trendComponent from "src/components/trendComponent.vue";
import { usePostStore } from "src/stores/posts";


const postStore = usePostStore()

const trendList=computed(()=>postStore.getTrendList)



</script>

<style lang="scss" scoped>
.trend-container {
  border-radius: 1rem;
}
</style>
