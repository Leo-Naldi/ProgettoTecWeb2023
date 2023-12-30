<template>
  <div class="trend-container bg-grey-2" style="max-width: full">
    <div class="flex justify-between items-center q-px-md q-py-sm">
      <p class="text-weight-bold text-h6" style="margin-bottom: -0.2rem">Channel to follow</p>
      <!-- <q-icon name="settings" size="xs" class="cursor-pointer" /> -->
    </div>
    <ChannelEnum :channels="randomChannels"></ChannelEnum>
    <div>
      <div>
        <p class="text-weight-bold text-center q-pa-sm cursor-pointer text-primary clickable" @click="showMoreHandler()">
          Show more</p>
      </div>

    </div>

  </div>
</template>

<!-- <script setup>
import { ref, onMounted, toRaw } from "vue";

import ChannelEnum from "./channel/ChannelEnum.vue";

import { useRouter } from "vue-router";

const props = defineProps({
  channels: {
    type: Array,
    required: true,
  },
})
const randomChannels = ref([])


console.log("props channel: ", props.channels.length)

const getRandomChannels = (() => {
  console.log("props channel: ", props.channels)
  console.log("props channel: ",  toRaw(props.channels).value) // TODO: vue3 props get value? sometimes work
  console.log("props channel: ",  JSON.parse(JSON.stringify(props.channels)))
  const channel_candidate = toRaw(props.channels).value&&toRaw(props.channels).value.length>0?toRaw(props.channels).value:[]

  if (channel_candidate.length > 0) {
    for (var i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * channel_candidate.length);
      randomChannels.value.push(channel_candidate[randomIndex])
      console.log("generated channels: ", channel_candidate[randomIndex])
    }
  }
})
const router=useRouter()

    const showMoreHandler = (() => {
      router.push({
        name: "disploreChannel",
      });
    })

onMounted(() => {
  getRandomChannels();


})

</script> -->

<script>
import { ref, onMounted, toRaw } from "vue";
import ChannelEnum from "../channel/ChannelEnum.vue";
import { useRouter } from "vue-router";
import { useChannelStore } from "src/stores/channels";
export default {
  data() {
    return {
      router: useRouter(),
    }
  },
  components: {
    ChannelEnum
  },
  setup() {
    const channelStore = useChannelStore()
    const randomChannels = ref([])
    // console.log("props value: ", propValue.value)

    const getRandomChannels = (() => {
      const store_allchannel = channelStore.getChannelLists
      // console.log("我获得的 sore channel 是：", store_allchannel)
      const channel_candidate = JSON.parse(JSON.stringify(store_allchannel))
      // console.log("我获得的 sore channel 是2：", channel_candidate)


      if (channel_candidate.length > 0) {
        for (var i = 0; i < 3; i++) {
          const randomIndex = Math.floor(Math.random() * channel_candidate.length);
          randomChannels.value.push(channel_candidate[randomIndex])
        }
      }


    })
    onMounted(() => {
      getRandomChannels();
    })
    return {
      randomChannels,
    }
  },
  methods: {
    showMoreHandler() {
      this.router.push({
        name: "disploreChannel",
      });
    }
  },
}








</script>

<style lang="scss" scoped>
.trend-container {
  border-radius: 1rem;
}
</style>
