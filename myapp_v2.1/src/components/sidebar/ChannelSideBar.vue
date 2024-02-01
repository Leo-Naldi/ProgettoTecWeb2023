<template>
  <div :class="ifShow ? 'trend-container' : 'trend-container bg-grey-2'" style="max-width: full" role="region" aria-label="Trend Container">
    <div class="flex justify-between items-center q-px-md q-py-sm" role="banner" aria-label="Channel Header" clickable>
      <q-icon name="fa-solid fa-users-rectangle" size="xs" class="bg-grey-2" />
      <p class="text-weight-bold text-h6" style="margin-bottom: -0.2rem">Channel to follow</p>
    </div>
    <ChannelEnum :channels="randomChannels"/>
    <div>
      <p class="text-weight-bold text-center q-pa-sm cursor-pointer text-primary clickable"
        @click="showMoreHandler()" role="button" tabindex="0" aria-label="Show More Channels">
        Show more</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, toRaw, computed } from "vue";
import ChannelEnum from "src/components/channel/ChannelEnum.vue";
import { useRouter } from "vue-router";
import { useChannelStore } from "src/stores/channel";
import { getUser } from "src/common/localStorageHandler";
import { useQuasar } from "quasar";

export default {
  data() {
    return {
      router: useRouter(),
      randomChannels: [],
      canShow: ref(false),
    }
  },
  components: {
    ChannelEnum
  },
  methods: {
    showMoreHandler() {
      if (getUser() != null) {
        this.router.push({
          name: "DisploreChannel",
        });
      }
      else {
        this.router.push({
          name: "DisploreChannelPublic",
        });
      }
    },
    getRandomChannels(channels) {
      const channel_candidate = JSON.parse(JSON.stringify(channels))

      if (channel_candidate.length > 0) {
        for (var i = 0; i < 3; i++) {
          const randomIndex = Math.floor(Math.random() * channel_candidate.length);
          this.randomChannels.push(channel_candidate[randomIndex])
        }
      }
      // console.log("Channel right side bar to props: ", this.randomChannels)
    }
  },
  props: {
    ifShow: {
      type: Boolean,
      default: false
    }
  },
  setup(){
    const $q = useQuasar()
    const channel_to_show = computed(()=>useChannelStore().getChannelLists)
    const official_channel_to_show = computed(()=>useChannelStore().getOfficialChannlLists)
    return{
      showLoading () {
        $q.loading.show()
      },
      hideLoading(){
        $q.loading.hide()
      },
      channel_to_show,
      official_channel_to_show
    }
  },
  watch:{
    channel_to_show(newV){
      this.getRandomChannels(newV)
      // console.log("【channelSideBar】 监听 channelStore computed channel 的值变化：", this.randomChannels)
    },
    official_channel_to_show(newV){
      this.getRandomChannels(newV)
    }
  },

  computed: {
    stored_channel() {
      if (getUser() != null) {
        return useChannelStore().getChannelLists
      } else {
        return useChannelStore().getOfficialChannlLists
      }
    },
  },
  async mounted() {
    this.getRandomChannels(this.channel_to_show)
    this.getRandomChannels(this.official_channel_to_show)


  }
}








</script>

<style lang="scss" scoped>
.trend-container {
  border-radius: 1rem;
}
</style>
