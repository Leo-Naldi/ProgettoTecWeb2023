<!-- <template>
  <FullMap></FullMap>
</template>

<script setup>
import FullMap from 'src/components/map/FullMap.vue';
</script> -->

<style scoped lang="sass">

.full-map
  width: 80vw
  height: 80vh
</style>

<template>
  <div id="mapContainer" class="full-map"></div>
  <p>Please insert a words in inputbar to visualize the map!</p>
</template>

<script>
import { useMapStore } from 'stores/map.js'
import 'leaflet/dist/leaflet.css'
import { ref, onMounted, computed, reactive, watchEffect, watch } from "vue";
import { useRouter } from "vue-router";
import { usePostStore } from 'src/stores/posts';
import { useNotificationsStore } from 'src/stores/notifications'
import { useAuthStore } from 'src/stores/auth.js';
import { useSocketStore } from "src/stores/socket";


export default {
  data() {
    return {
      postStore: usePostStore(),
      router: useRouter(),
      mapStore: useMapStore(),
      notificationStore: useNotificationsStore(),
      myPos: [44.491, 11.352]
    }
  },
  methods: {
    drawMap(positions, popups){
      this.mapStore.resetMap()
      this.mapStore.initializeMapAndLocator("mapContainer");
      if (positions.length > 0) {
        this.mapStore.setCenter(positions[Math.floor(positions.length / 2)])
        // this.mapStore.addMarkers(positions)
        this.mapStore.addMarkersWithPopUp(positions, popups)
        this.mapStore.addPolyline(positions)
        this.mapStore.addCustomMarker(this.myPos, "home")
        this.mapStore.addLayerMarker()
        this.mapStore.addLayerLine()
      }
      else{
        this.mapStore.setCenter(this.mapStore.getCurrentLocation())
        // this.mapStore.addMarker(this.mapStore.getCurrentLocation())
        this.mapStore.addMarkerWithPopUp(this.mapStore.getCurrentLocation(), "home!" )
        this.mapStore.addLayerMarker()
      }
    },
    async fetchSearchResults(keywords) {
      console.log("你在查找的hashtag是：", keywords + " ")

      const res = await this.postStore.searchHashtags(keywords)
      let positions=[]
      let popups=[]
      if (keywords[0] == '#') {
        const origin = this.postStore.searchHashtags_filtered(res, keywords + " ")
        positions = origin.map(obj => { return obj.meta.geo.coordinates })
        popups = origin.map(obj=> {return obj.content.text})
      }
      else{
        positions = res.map(obj => { return obj.meta.geo.coordinates })
        popups = res.map(obj=> {return obj.content.text})

      }
      // socketPos = notificationStore.getHashtagWithPosFilter("#"+keywords+" ")
      // finalPos = positions.concat(socketPos)
      console.log("找到的数组是：", positions)
      this.drawMap(positions, popups)
    },
  },
  watch: {
    $route: {
      handler: function (val) {
        // this.mapStore.resetMap()
        // this.mapStore.initializeMapAndLocator("mapContainer");
        if (val.params.keywords){
          this.fetchSearchResults(val.params.keywords)
        }
      },
      // 深度观察监听
      deep: false,
      immediate: false,
    }
  },
  async mounted() {
    const paramId = this.router.currentRoute.value.params.keywords;
    this.notificationStore.set_realtime_keyword(paramId)
    // this.mapStore.initializeMapAndLocator("mapContainer");
    if (paramId){
      await this.fetchSearchResults(paramId)
    }
    /* const res = await this.postStore.searchHashtags(paramId)
    let positions=[]
    if (paramId[0] == '#') {
        const origin = this.postStore.searchHashtags_filtered(res, paramId + " ")
        positions = origin.map(obj => { return obj.meta.geo.coordinates })
      }
    positions = res.map(obj => { return obj.meta.geo.coordinates })
    this.drawMap(positions) */

    // console.log("初始化了！", paramId)
  }
}
</script>
