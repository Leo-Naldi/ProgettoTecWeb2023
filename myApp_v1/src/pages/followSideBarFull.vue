<template>
  <div class="trend-container " style="max-width: full">
    <div class="flex justify-between items-center q-px-md q-py-sm">
      <p class="text-weight-bold text-h5 q-pa-md">Displore more Channel</p>
      <q-icon name="settings" size="xs" class="cursor-pointer" clickable>
        <q-popup-proxy>
          <ShowDialog>
            <q-form @submit="onSubmit" class="q-gutter-md">
              <div class="q-pt-md">Don't show followed:

                <q-toggle v-model="ifFilterFollowed" checked-icon="check" color="primary" unchecked-icon="clear" />
              </div>
            </q-form>
          </ShowDialog>
        </q-popup-proxy>
      </q-icon>
    </div>
    <ChannelEnum :channels="channel_list"></ChannelEnum>

  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onMounted, computed, toRaw, watch } from "vue";

// import ChannelEnum from "./channel/ChannelEnum.vue";
import { useChannelStore } from "src/stores/channels";
import { useAuthStore } from "src/stores/auth";
import ChannelEnum from "src/components/channel/ChannelEnum.vue";
import ShowDialog from "src/components/ShowDialog.vue";

const channelStore = useChannelStore()
const authStore = useAuthStore()
const ifFilterFollowed = ref(false)
const channel_list = ref([])

const onSubmit = (() => {
  ifFilterFollowed.value = true
  console.log("ifFilter: ", toRefs(props))
})
watch(
  () => ifFilterFollowed.value,
  (newV) => {
    console.log("filtered? ", ifFilterFollowed.value)
    if (newV == false) {
      channel_list.value = channelStore.getChannelLists

    }
    else {
      const user_json = authStore.getUser()
      const list_joinedChannels = user_json.joinedChannels
      const data = channelStore.getChannelLists

      const filteredData = data.filter(item => !list_joinedChannels.includes(item.name))
      console.log("ifFiltewwwwwwwwwr: ", filteredData)

      channel_list.value = filteredData
    }
  },
  {
    immediate: true
  }
)
// const channel_list = computed(() => {
//   if (!ifFilterFollowed.value) {
//     return channelStore.getChannelLists

//   }
//   else {
//     //TODO:返回没有 follow 的频道
//     const user_json = authStore.getUser()
//     const list_joinedChannels = user_json.joinedChannels
//     const data = channelStore.getChannelLists

//     const filteredData = data.filter(item => !list_joinedChannels.includes(item.name))
//     console.log("ifFiltewwwwwwwwwr: ", filteredData)

//     return filteredData
//   }
// })


</script>

<style lang="scss" scoped>
.trend-container {
  border-radius: 1rem;
}
</style>
