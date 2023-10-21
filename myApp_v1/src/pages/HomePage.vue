<template>
  <q-page padding>
    <!-- content -->
    Home
    <br>
    <!-- {{ all_posts }} -->
    <!-- <p>all channel：{{ all_channels }}</p> -->
    <p>{{ value }}</p>
    <!-- <div style="height: calc(100vh - 50px)">
      <GMapMap
        :center="center"
        :zoom="10"
      />
    </div> -->
    <!-- <div :id=mapId style="width:100%;height: calc(100vh - 50px); z-index:1;"></div> -->
    <!-- <p>autocomplate channel：{{ all_auto_channels }}</p> -->
    <!-- <p>get daily_news: {{ res_2 }}</p> -->
    <ShowMap  :mapId="mapId" :my-position="[51,6]"></ShowMap>
    <p>dsjdsagjhdsjgdsgdsgdsgdsgd</p>
    <ShowMap  mapId="my-12345" :my-position="[51.431,6.3512]"></ShowMap>
  </q-page>
</template>

<script setup>
import { usePostStore } from 'src/stores/posts.js';
import { useChannelStore } from 'src/stores/channels.js';
import { ref, onMounted, computed, } from "vue";
import  ShowMap  from 'src/components/map/ShowMap.vue'

// import { useMapStore } from 'src/stores/map.js'
// import 'leaflet/dist/leaflet.css'
// const mapStore = useMapStore()


const center = { lat: 51.093048, lng: 6.84212 };
const postStore = usePostStore()
const channelStore= useChannelStore()

const all_posts = computed(() => postStore.getPosts[0])
const all_channels = computed(()=> channelStore.getChannels[0])

const all_auto_channels= computed(()=>channelStore.getAutoComplateAllChannel[0])


const value =ref(null)
const fetchData = async () => {
  value.value = await channelStore.searchChannel("daily_news")
}


const mapId= 'map-1'
onMounted(()=>{
  // mapStore.initializeMapAndLocator(mapId);
  fetchData()
})

</script>
