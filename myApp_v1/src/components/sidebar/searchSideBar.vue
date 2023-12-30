<!-- TODO:点击显示更多，默认只显示关键字和提及的搜索 -->
<template>
  <div class="trend-container bg-grey-2 q-pa-md">
    <div class="flex justify-between items-center q-px-md q-py-sm">
      <p class="text-weight-bold text-h5" style="margin-bottom: -0.2rem">Search filter</p>
    </div>
    <div class="q-pl-sm">
      <div class="q-pa-md text-h6 text-left text-bold">Contains</div>
      <div class="q-gutter-sm" style="margin-left: 2rem">
        <q-input outlined v-model="searchFilter.contains.keywords" placeholder="contains keywords" />
        <q-input outlined v-model="searchFilter.contains.mentions" placeholder="contains mentions" />
      </div>
    </div>
    <div v-if="ifShowMore==false" >
        <p class="text-weight-bold text-center q-pt-md cursor-pointer text-primary clickable" @click="ifShowMore=true">
          Show more</p>
      </div>
      <div v-else>
        <p class="text-weight-bold text-center q-pt-md cursor-pointer text-primary clickable" @click="ifShowMore=false">
          hide</p>
      </div>
    <div v-if="ifShowMore==true">
    <q-separator inset="" spaced="10px" />
    <div class="q-pl-sm">
      <div class="q-pa-md text-h6 text-left text-bold">From</div>
      <div class="q-gutter-sm" style="margin-left: 2rem">
        <q-input outlined v-model="searchFilter.from.user" placeholder="from @user" />
        <q-input outlined v-model="searchFilter.from.channel" placeholder="from §channel" />
      </div>
    </div>
    <q-separator inset="" spaced="10px" />
    <div class="q-pl-sm">
      <div class="q-pa-md text-h6 text-left text-bold">To</div>
      <div class="q-gutter-sm" style="margin-left: 2rem">
        <q-input outlined v-model="searchFilter.to.user" placeholder="to @user" />
        <q-input outlined v-model="searchFilter.to.channel" placeholder="to §channel" />
      </div>
    </div>
    <q-separator inset="" spaced="10px" />
    <div class="q-pl-sm">
      <div class="q-pa-md text-h6 text-left text-bold">Is Reply</div>
      <div class="q-gutter-sm" style="margin-left: 2rem">
        <div class="q-pt-md">is reply:
          <q-toggle v-model="searchFilter.reply" checked-icon="check" color="primary" unchecked-icon="clear" />
        </div>
      </div>
    </div>
    <q-separator inset="" spaced="10px" />
    <div class="q-pl-sm">
      <div class="q-pa-md text-h6 text-left text-bold">Contains media</div>
      <div class="q-gutter-sm" style="margin-left: 2rem">
        <div class="q-pt-md">contains media:
          <q-toggle v-model="searchFilter.media" checked-icon="check" color="primary" unchecked-icon="clear" />
        </div>
      </div>
    </div>
    <q-separator inset="" spaced="10px" />
    <div class="q-pl-sm">
      <div class="q-pa-md text-h6 text-left text-bold">Satisfaied math condition</div>
      <div class="q-gutter-sm" style="margin-left: 2rem">
        <q-input outlined v-model="searchFilter.count.min_reply" placeholder="with a min reply count" />
        <q-input outlined v-model="searchFilter.count.min_reviews" placeholder="with a min review count" />
        <q-input outlined v-model="searchFilter.count.min_likes" placeholder="with a min like count" />
        <q-input outlined v-model="searchFilter.count.min_dislikes" placeholder="with a min dislike count" />
      </div>
    </div>
    <q-separator inset="" spaced="10px" />
    <div class="q-pl-sm q-pb-md">
      <div class="q-pa-md text-h6 text-left text-bold">With Time Frame</div>

      <div class="q-gutter-sm" style="max-width: 300px; margin-left: 2rem">
        <q-input filled label="start" v-model="searchFilter.timeFrame.start">
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="searchFilter.timeFrame.start" mask="YYYY-MM-DD HH:mm">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>

          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-time v-model="searchFilter.timeFrame.start" mask="YYYY-MM-DD HH:mm" format24h>
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-input filled label="end" v-model="searchFilter.timeFrame.end">
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="searchFilter.timeFrame.end" mask="YYYY-MM-DD HH:mm">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>

          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-time v-model="searchFilter.timeFrame.end" mask="YYYY-MM-DD HH:mm" format24h>
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";

const searchFilter = reactive({
  contains: {
    keywords: "",
    mentions: ""
  },
  from: {
    user: "",
    channel: ""
  },
  to: {
    user: "",
    channel: ""
  },
  reply: false,
  media: false,
  count: {
    min_reply: null,
    min_likes: null,
    min_dislikes: null,
    min_reviews: null
  },
  timeFrame: {
    start: '2023-11-19 12:44',
    end: '2023-11-19 22:44'
  }
})

const ifShowMore = ref(false)

</script>

<style lang="scss" scoped>
.trend-container {
  border-radius: 1rem;
}
</style>
