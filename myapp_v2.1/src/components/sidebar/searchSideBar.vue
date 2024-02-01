<template>
  <div class="trend-container bg-grey-2 q-pa-md" role="region" aria-label="Search Filter">
    <div class="flex justify-between items-center q-px-md q-py-sm">
      <p class="text-weight-bold text-h5" style="margin-bottom: -0.2rem">Search filter</p>
    </div>
    <div class="q-pl-sm">
      <div class="q-pa-md text-h6 text-left text-bold" aria-label="Contains Section">Contains</div>
      <div class="q-gutter-sm" style="margin-left: 2rem">
        <q-input outlined v-model="searchFilter.contains.keywords" placeholder="contains #keywords" aria-label="Contains Keywords" />
        <q-input outlined v-model="searchFilter.contains.mentions" placeholder="contains mentions" aria-label="Contains Mentions" />
        <!-- <q-input outlined v-model="searchFilter.contains.text" placeholder="contains text" /> -->
      </div>
    </div>
    <div v-if="ifShowMore == false">
      <p class="text-weight-bold text-center q-pt-md cursor-pointer text-primary clickable" @click="ifShowMore = true" role="button" tabindex="0" aria-label="Show More">
        Show more</p>
    </div>
    <div v-else>
      <p class="text-weight-bold text-center q-pt-md cursor-pointer text-primary clickable" @click="ifShowMore = false" role="button" tabindex="0" aria-label="Hide">
        hide</p>
    </div>
    <div v-if="ifShowMore == true">
      <q-separator inset="" spaced="10px" aria-hidden="true" />
      <div class="q-pl-sm">
        <div class="q-pa-md text-h6 text-left text-bold" aria-label="From Section">From</div>
        <div class="q-gutter-sm" style="margin-left: 2rem">
          <q-input outlined v-model="searchFilter.from.user" placeholder="from @user" aria-label="From User" />
        </div>
      </div>
      <q-separator inset="" spaced="10px" />
      <div class="q-pl-sm">
        <div class="q-pa-md text-h6 text-left text-bold" aria-label="Dest User">Dest</div>
        <div class="q-gutter-sm" style="margin-left: 2rem">
          <q-input outlined v-model="searchFilter.to.user" placeholder="to @user" aria-label="dest to @user" />
          <q-input outlined v-model="searchFilter.to.channel" placeholder="to §channel" aria-label="dest to §channel" />
        </div>
      </div>
      <q-separator inset="" spaced="10px" />
      <div class="q-pl-sm">
        <div class="q-pa-md text-h6 text-left text-bold" aria-label="is reply">Is Reply</div>
        <div class="q-gutter-sm" style="margin-left: 2rem">
          <div class="q-pt-md">is reply:
            <q-toggle v-model="searchFilter.reply" checked-icon="check" color="primary" unchecked-icon="clear" aria-label="is reply to a post" />
          </div>
        </div>
      </div>
      <q-separator inset="" spaced="10px" />
      <div class="q-pl-sm">
        <div class="q-pa-md text-h6 text-left text-bold" aria-label="Contains media">Contains media</div>
        <div class="q-gutter-sm" style="margin-left: 2rem">
          <div class="q-pt-md">contains media:
            <q-toggle v-model="searchFilter.media" checked-icon="check" color="primary" unchecked-icon="clear" aria-label="Contains media" />
          </div>
        </div>
      </div>
      <q-separator inset="" spaced="10px" />
      <div class="q-pl-sm">
        <div class="q-pa-md text-h6 text-left text-bold" aria-label="has min like/dislike">Satisfaied math condition</div>
        <div class="q-gutter-sm" style="margin-left: 2rem">
          <q-input outlined v-model="searchFilter.count.min_likes" placeholder="with a min like count"  aria-label="Has Min Like"/>
          <q-input outlined v-model="searchFilter.count.min_dislikes" placeholder="with a min dislike count" aria-label="Has Min Dislike" />
        </div>
      </div>
      <q-separator inset="" spaced="10px" />
      <div class="q-pl-sm q-pb-md">
        <div class="q-pa-md text-h6 text-left text-bold" aria-label="With Time Frame">With Time Frame</div>

        <div class="q-gutter-sm" style="max-width: 300px; margin-left: 2rem">
          <q-input filled label="before" v-model="searchFilter.timeFrame.before">
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="searchFilter.timeFrame.before" mask="YYYY-MM-DD HH:mm">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat role="button" aria-label="Close Button" />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>

            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-time v-model="searchFilter.timeFrame.before" mask="YYYY-MM-DD HH:mm" format24h>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat role="button" aria-label="Close Button" />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input filled label="after" v-model="searchFilter.timeFrame.after">
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="searchFilter.timeFrame.after" mask="YYYY-MM-DD HH:mm">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat role="button" aria-label="Close Button" />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>

            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-time v-model="searchFilter.timeFrame.after" mask="YYYY-MM-DD HH:mm" format24h>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat role="button" aria-label="Close Button" />
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
import { ref, reactive,  watch } from "vue";
import { useSearchStore } from "src/stores/search";

const searchFilter = reactive({
  contains: {
    keywords: "",
    mentions: "",
    text: "",
  },
  from: {
    user: "",
  },
  to: {
    user: "",
    channel: ""
  },
  reply: false,
  media: false,
  count: {
    min_likes: null,
    min_dislikes: null,
  },
  timeFrame: {
    before: '2023-11-19 12:44',
    after: '2023-11-19 22:44'
  }
})

watch(searchFilter, (newVal) => {
  // Do something when searchFilter changes
  console.log("Search filter changed in component B:", newVal);
  useSearchStore().setSearchFilter(newVal)
},{immediate:false, deep:true});

const ifShowMore = ref(false)

</script>

<style lang="scss" scoped>
.trend-container {
  border-radius: 1rem;
}
</style>
