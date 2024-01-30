<template>
  <div class="trend-container " style="max-width: full">
    <div class="flex justify-between items-center q-px-md q-py-sm">
      <p class="text-weight-bold text-h5 q-pa-md">Displore more Channel</p>
      <q-icon name="settings" size="sm" class="mySettingButton" clickable>
        <q-popup-proxy v-if="logged">
          <CloseDialog>
              <div class="q-pt-md">Don't show followed:
                <q-toggle v-model="allowFilter" checked-icon="check" color="primary" unchecked-icon="clear" />
              </div>
          </CloseDialog>
        </q-popup-proxy>
        <q-tooltip v-else class="bg-primary">Login to filter your followed channel!</q-tooltip>

      </q-icon>
    </div>
    <ChannelEnum :channels="channel_list" />

  </div>
</template>

<script>
import { ref,watch,computed, toRaw } from "vue";
import { getUser } from "src/common/localStorageHandler";
import { useUserStore } from "src/stores/user";
import { useChannelStore } from "src/stores/channel";
import CloseDialog from "src/components/utils/CloseDialog.vue";
import ChannelEnum from "src/components/channel/ChannelEnum.vue";

export default {

  setup(){
    const logged = ref(getUser()!=null)
    const store_channel = logged.value? computed(()=>useChannelStore().getChannelLists) : computed(()=>useChannelStore().getOfficialChannlLists)
    const allowFilter= ref(false)

    // watch(allowFilter, (newV)=>{
    //   if(newV!=true){
    //     channel_list.value = store_channel.value
    //     console.log("？？？", computed(()=>useChannelStore().getChannelLists))
    //   }
    //   else{
    //     const list_joinedChannels = userJson.value.joinedChannels

    //     const filteredData = store_channel.filter(obj1 => !list_joinedChannels.some(obj2 => obj2.name === obj1.name));
    //     // console.log("ifFiltewwwwwwwwwr: ", filteredData)

    //     channel_list.value = filteredData
    //   }
    // },{immediate:true, deep:true})


    return {
      allowFilter,
      store_channel,
      logged
    }
  },
  components:{
    CloseDialog,
    ChannelEnum
  },
  data(){
    const channel_list = ref([])
    return {
      channel_list
    }
  },
  watch:{
    allowFilter(newV){
      if(newV!=true){
        this.channel_list = this.store_channel
      }
      else{
        // TODO: 只有登录用户才可享用的过滤已追踪的频道
        const list_joinedChannels = getUser().joinedChannels

        const filteredData = JSON.parse(JSON.stringify(this.store_channel)).filter(obj1 => !list_joinedChannels.some(obj2 => obj2.name === obj1.name));
        // console.log("ifFiltewwwwwwwwwr: ", filteredData)

        this.channel_list = filteredData
        console.log("准备过滤啦！", list_joinedChannels, JSON.parse(JSON.stringify(this.store_channel)), this.channel_list)
      }
    },

  },
  // 只是 debug 用的
  mounted(){
    this.channel_list = this.store_channel
    // const toRaw_hashTrend = toRaw(this.channel_list)
    // console.log("channel displore get filtered value toRaw is: ", toRaw_hashTrend)
    // const toRaw_public = toRaw(this.stored_public_channel)
    // console.log("channel displore get filtered value computed: ", this.channel_list)
    // console.log("channel displore get value toRaw is: ", toRaw_public)
    // console.log("channel displore get value computed: ", this.stored_public_channel)
    // const toRaw_all = toRaw(this.stored_all_channel)
    // console.log("channel displore get value toRaw is: ", toRaw_all)
    // console.log("channel displore get value computed: ", this.stored_all_channel)
  }
}
</script>





<style lang="scss">

.trend-container {
  border-radius: 1rem;
}

.mySettingButton {
  cursor: pointer;
  margin-top: -1rem; // to set icon and heading in the same line(visually only)
}
</style>
