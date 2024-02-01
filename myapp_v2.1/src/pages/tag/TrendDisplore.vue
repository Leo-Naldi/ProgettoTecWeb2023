<template>
  <div class="trend-container" style="max-width: full" role="region" aria-label="Trending Hashtags">
    <div class="flex justify-between items-center q-px-md q-py-md">
      <p class="text-weight-bold text-h5 q-pa-md">Displore hashtags all that you've sent! </p>
    </div>
    <p v-if="trendList.length <= 0" class="text-center q-pa-md" aria-live="assertive" role="status">
      You haven't written any post with hashtags!
    </p>
    <q-list v-else role="list" aria-live="polite">
      <q-item
        v-for="(trend, i) in Object.entries(trendList)
          .map(([tag, tweet]) => ({ tag, tweet: tweet.length }))
          .sort((a, b) => b.tweet - a.tweet)"
        :key="i"
        class="cursor-pointer"
        role="listitem"
        aria-label="Trending Hashtag"
      >
        <TrendBlock :tag="trend.tag" :tweet="trend.tweet" v-bind="trend" />
      </q-item>
    </q-list>
  </div>
</template>

<script>
import TrendBlock from "src/components/tag/TrendBlock.vue";
import { toRaw,computed, ref } from "vue";
// import CloseDialog from "src/components/utils/CloseDialog.vue";

import { usePostStore } from "src/stores/post";
import { getUser } from "src/common/localStorageHandler";


export default {
  components:{
    TrendBlock,
    // CloseDialog
  },
  // setup(){
  //   return {
  //     localFilter: ref(false),
  //     loggedIn: getUser()
  //   }
  // },
  computed:{
    trendList(){
      // return usePostStore().getTrendList
      return usePostStore().getHashtagTrends
    }
  },
  mounted(){
    const toRaw_hashTrend = toRaw(this.trendList)
    console.log("trend displore get value toRaw is: ", toRaw_hashTrend, Object.entries(toRaw_hashTrend))
    // console.log("trend displore get value computed: ", this.trendList)
  }
}
</script>


