<template>
  <div id="my_parent">
  <p>{{ searchResults.positions }}</p>
  <div :id=searchResults.mapId class="full-map"></div>
  <!-- <div id="mapContainer" class="full-map"></div> -->
</div>
</template>

<script setup>
import { useMapStore } from 'stores/map.js'
import 'leaflet/dist/leaflet.css'
import { ref, onMounted, computed, reactive, watchEffect, watch } from "vue";
import { useRouter } from "vue-router";
import { usePostStore } from 'src/stores/posts';
import { useNotificationsStore } from 'src/stores/notifications'
import { useAuthStore } from 'src/stores/auth.js';
import { useSocketStore } from "src/stores/socket";


const mapStore = useMapStore()
const router = useRouter()
const postStore = usePostStore()
// use for socket
const authStore = useAuthStore()
const socketStore = useSocketStore()
const mytoken = authStore.getToken()
const myhandle = authStore.getUserHandle()
socketStore.setSocket(myhandle, mytoken);
const mysocket = socketStore.getSocket;

const myPos = [44.491, 11.352]


const searchResults = reactive({
  mapId: "fullmap-" + router.currentRoute.value.params.keywords,
  origin: [],
  positions: [],
  // socketPos:[],
  // finalPos:[]
})


const isFetchComplete = ref(false);
const fetchSearchResults = async (keywords) => {
  console.log("你在查找的hashtag是：", keywords + " ")

  const res = await postStore.searchHashtags("#" + keywords)
  searchResults.origin = postStore.searchHashtags_filtered(res, "#" + keywords + " ")
  searchResults.positions = searchResults.origin.map(obj => { return obj.meta.geo.coordinates })
  // searchResults.socketPos = notificationStore.getHashtagWithPosFilter("#"+keywords+" ")
  // searchResults.finalPos = searchResults.positions.concat(searchResults.socketPos)
  console.log("找到的数组是：", searchResults.positions)
  if (searchResults.positions.length > 0) {
    isFetchComplete.value = true
  }
  // console.log("socket的数组是：",searchResults.socketPos)
  // // console.log("最后得到的数组是：",searchResults.finalPos)
}
watch(isFetchComplete, (value) => {
  if (value == true) {
    // console.log("complete: ", searchResults.positions);
    // console.log("newaMapName ", searchResults.mapId);
    // mapStore.initializeMapAndLocator("mapContainer");
    mapStore.initializeMapAndLocator(searchResults.mapId);
    mapStore.setCenter(searchResults.positions[Math.floor(searchResults.positions.length / 2)])
    mapStore.addMarkers(searchResults.positions)
    mapStore.addPolyline(searchResults.positions)
    mapStore.addCustomMarker(myPos, "home")
    mapStore.addLayer()
}

}
);
/* router.beforeEach((to, from, next) => {
  console.log("oldMapName ");
  const mapContainer = document.getElementById("mapContainer");
  if (mapContainer) {
    mapContainer.remove();
  }
  next();
}); */
watch(
  () => router.currentRoute.value.params,
  async (v) => {
    mapStore.removeAllMarkers()
    isFetchComplete.value=false

    searchResults.mapId="fullmap-"+v.keywords

    fetchSearchResults(v.keywords)
  },
  {
    deep: false,
    immediate: true,
  }
);
/* watch(
  () => [isFetchComplete, router.currentRoute.value.params],
  async (res) => {
    console.log("路由参数发生了变化！", res[0]==true)
    console.log("路由参数发生了变化！", res[1].keywords)
    mapStore.removeAllMarkers()
    fetchSearchResults(res[1].keywords)
    if(res[0]==true){
      mapStore.initializeMapAndLocator(searchResults.mapId);
    mapStore.setCenter(searchResults.positions[Math.floor(searchResults.positions.length / 2)])
    mapStore.addMarkers(searchResults.positions)
    mapStore.addPolyline(searchResults.positions)
    mapStore.addCustomMarker(myPos, "home")
    mapStore.addLayer()
    }
  },
  {
    deep: false,
    immediate: true,
  }
); */

onMounted(() => {
  const paramId = router.currentRoute.value.params.keywords;
  console.log("now you're searching for words: ", paramId)

  mysocket.on("message:created", (message) => {
    if (message.meta.geo && message.content.text.includes("#" + paramId + " ")) {
      isFetchComplete.value = true
      searchResults.positions.push(message.meta.geo.coordinates)

      if (isFetchComplete.value == true) {
        mapStore.addMarker(message.meta.geo.coordinates)

        mapStore.addPolyline(searchResults.positions)
        mapStore.addLayer()

      }
      // searchResults.socketPos.push(message.meta.geo.coordinates)
      // searchResults.finalPos = searchResults.positions.concat(searchResults.socketPos)
    }
    // notificationStore.set_all_unread(message)
    // const hashtagWithPosFilterRes= this.all_unread.filter(obj => obj.meta.geo && obj.content.text.includes(tag));
    // return hashtagWithPosFilterRes.map((obj)=>{return obj.meta.geo.coordinates})
  });
})


</script>

<style scoped lang="sass">

.full-map
  // width: 100%
  // z-index:1
  width: 80vw
  height: 80vh
  // height: calc(100vw / 1.618)
  // height: calc(100vh - 100px)
  // max-width: calc(90v - 10px)
</style>
