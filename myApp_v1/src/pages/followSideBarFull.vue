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
import { ref, watch } from "vue";

import { useChannelStore } from "src/stores/channels";
import { useAuthStore } from "src/stores/auth";
import ChannelEnum from "src/components/channel/ChannelEnum.vue";
import ShowDialog from "src/components/ShowDialog.vue";
import { useUserStore } from "src/stores/user";

const channelStore = useChannelStore()
const userStore = useUserStore()
const authStore = useAuthStore()
const ifFilterFollowed = ref(false)
const channel_list = ref([])

const onSubmit = (() => {
  ifFilterFollowed.value = true
})
watch(
  () => ifFilterFollowed.value,
  (newV) => {
    console.log("filtered? ", ifFilterFollowed.value)
    if (newV == false) {
      channel_list.value = channelStore.getChannelLists

    }
    else {
      const store_channel = channelStore.getChannelLists
      const all_channel_list = JSON.parse(JSON.stringify(store_channel))
      const user_json1 =ref([])
      user_json1.value= userStore.getUserJson

      const user_json = JSON.parse(JSON.stringify(user_json1.value))
      const list_joinedChannels = user_json.joinedChannels

      const filteredData = all_channel_list.filter(obj1 => !list_joinedChannels.some(obj2 => obj2.name === obj1.name));
      // console.log("ifFiltewwwwwwwwwr: ", filteredData)

      channel_list.value = filteredData
    }
  },
  {
    immediate: true
  }
)



</script>

<style lang="scss" scoped>
.trend-container {
  border-radius: 1rem;
}
</style>
