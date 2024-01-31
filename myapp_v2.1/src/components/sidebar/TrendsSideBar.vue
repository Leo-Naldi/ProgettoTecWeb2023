<template>
  <div :class="ifShow ? 'trend-container':'trend-container bg-grey-2' " style="max-width: full">
    <div class="flex justify-between items-center q-px-md q-py-sm">
      <q-icon name="fa-solid fa-arrow-trend-up" size="xs" class="bg-grey-2" />
      <!-- <i class="fa-solid fa-arrow-trend-up"></i> -->
      <p  class="text-weight-bold text-h6" style="margin-bottom: -0.2rem">Trends for you</p>
    </div>
    <!-- <p>{{ trendList }}</p> -->
<!--     <p>{{ Object.entries(trendList)
  .map(([tag, tweets]) => ({ tag, tweets: tweets.length }))
  .sort((a, b) => b.tweets - a.tweets)  }}</p> -->
  <!-- <p> {{ sortedFlatedList }}</p> -->
  <p v-if="trendList.length<=0" class="text-center q-pa-md">you haven't written any post with hashtags!</p>
    <div v-else>
      <q-list>
        <q-item v-for="(trend, i) in Object.entries(trendList)
    .map(([tag, tweet]) => ({ tag, tweet: tweet.length }))
    .sort((a, b) => b.tweet - a.tweet).slice(0,4)" :key="i" class="cursor-pointer">
          <TrendBlock  :tag="trend.tag" :tweet="trend.tweet" v-bind="trend" />
          <!-- <p>{{ trend }}</p> -->
        </q-item>
      </q-list>
      <div  ><p class="text-weight-bold text-center q-pa-sm cursor-pointer text-primary" @click="$router.push({ name: 'DisploreHashtag' })">Show more</p></div>
    </div>
</div>
</template>

<script>
import { ref, onMounted, toRaw,computed } from "vue";
import TrendBlock from "src/components/tag/TrendBlock.vue";
import { useRouter } from "vue-router";
import { usePostStore } from "src/stores/post";


export default {
  data() {
    return {
      router: useRouter(),
      randomChannels: []
    }
  },
  components: {
    TrendBlock
  },
  props:{
    ifShow:{
      type: Boolean,
      default: false
    }
  },
  computed:{
    trendList(){
      return usePostStore().getHashtagTrends
    }
  },
  mounted(){
    // const toRaw_hashTrend = toRaw(this.trendList)
    // console.log("trend right side bar get value toRaw is: ", toRaw_hashTrend)
    // console.log("trend right side bar get value computed: ", this.trendList)
  }
}








</script>

<style lang="scss" scoped>
.trend-container {
  border-radius: 1rem;
}
</style>
