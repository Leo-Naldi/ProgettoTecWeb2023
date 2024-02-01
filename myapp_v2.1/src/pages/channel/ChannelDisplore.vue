<template>
  <div class="trend-container" role="region" aria-label="Explore Channel">
    <div class="flex justify-between items-center q-px-md q-py-sm">
      <p class="text-weight-bold text-h5 q-pa-md">Explore more Channels</p>
      <q-icon name="settings" size="sm" class="mySettingButton" clickable role="button" aria-haspopup="true"
        aria-expanded="false">
        <q-popup-proxy v-if="logged">
          <CloseDialog>
            <div class="q-pt-md">
              Don't show followed:
              <q-toggle v-model="allowFilter" checked-icon="check" color="primary" unchecked-icon="clear"
                aria-label="Toggle Followed Channels" />
            </div>
          </CloseDialog>
        </q-popup-proxy>
        <q-tooltip v-else class="bg-primary" role="alert">
          Login to filter your followed channel!
        </q-tooltip>
      </q-icon>
    </div>
    <ChannelEnum :channels="channel_list" role="listbox" />
  </div>
</template>

<script>
import { ref, watch, computed, toRaw } from "vue";
import { getUser } from "src/common/localStorageHandler";
import { useUserStore } from "src/stores/user";
import { useChannelStore } from "src/stores/channel";
import CloseDialog from "src/components/utils/CloseDialog.vue";
import ChannelEnum from "src/components/channel/ChannelEnum.vue";

export default {

  setup() {
    const logged = ref(getUser() != null)
    const store_channel = logged.value ? computed(() => useChannelStore().getChannelLists) : computed(() => useChannelStore().getOfficialChannlLists)
    const allowFilter = ref(false)

    return {
      allowFilter,
      store_channel,
      logged
    }
  },
  components: {
    CloseDialog,
    ChannelEnum
  },
  data() {
    const channel_list = ref([])
    return {
      channel_list
    }
  },
  watch: {
    allowFilter(newV) {
      if (newV != true) {
        this.channel_list = this.store_channel
      }
      else {
        // TODO: only logged user can filter followed channel
        const list_joinedChannels = getUser().joinedChannels

        const filteredData = JSON.parse(JSON.stringify(this.store_channel)).filter(obj1 => !list_joinedChannels.some(obj2 => obj2.name === obj1.name));

        this.channel_list = filteredData
      }
    }
  },
  mounted(){
    this.channel_list = this.store_channel
  }
}
</script>





<style lang="scss">
.trend-container {
  border-radius: 1rem;
  max-width: full;
}

.mySettingButton {
  cursor: pointer;
  margin-top: -1rem; // to set icon and heading in the same line(visually only)
}
</style>
