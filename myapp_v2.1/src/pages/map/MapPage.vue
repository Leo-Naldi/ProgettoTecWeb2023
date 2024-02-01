<style scoped lang="sass">
.full-map
  width: 80vw
  height: 80vh
</style>

<template>
  <div id="MapPage" class="full-map" role="application"
    aria-label="Map showing posts locations"
    tabindex="0"></div>
  <p class="text-center" v-if="!keywords && !channels">Please insert a words in inputbar to visualize the map!</p>
</template>

<script>
import 'leaflet/dist/leaflet.css'
import { ref, onMounted, computed, reactive, watchEffect, watch } from "vue";
import { useRouter } from "vue-router";

import { usePostStore } from "src/stores/post";
import { useMapStore } from "src/stores/map";
import { useNotificationsStore } from "src/stores/notification";
import {useSocketStore} from 'stores/socket.js'


import { showPositive, showNegative } from 'src/common/utils';

import { getPostsWithHashtag } from "src/common/utils";

export default {
  data() {
    return {
      postStore: usePostStore(),
      router: useRouter(),
      mapStore: useMapStore(),
      notificationStore: useNotificationsStore(),
      myPos: [44.491, 11.352],
      keywords: '',
      channels: '',
    }
  },
  created() {
        L.Marker.prototype.options.icon = L.icon({
            iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
            iconUrl: require("leaflet/dist/images/marker-icon.png"),
            shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [41, 41],
        });
    },
  methods: {
    drawMap(positions, popups) {
      this.mapStore.resetMap()
      this.mapStore.initializeMapAndLocator();
      if (positions.length > 0) {
        this.mapStore.setCenter(positions[Math.floor(positions.length / 2)])
        // this.mapStore.addMarkers(positions)
        this.mapStore.addMarkersWithPopUp(positions, popups)
        this.mapStore.addPolyline(positions)
        this.mapStore.addCustomMarker(this.myPos, "home")
        this.mapStore.addLayerMarker()
        this.mapStore.addLayerLine()
      }
      else {
        this.mapStore.setCenter(this.mapStore.getCurrentLocation())
        this.mapStore.addMarkerWithPopUp(this.mapStore.getCurrentLocation(), "home!")
        this.mapStore.addLayerMarker()
      }
    },
    async fetchSearchResults(keywords, enterType) {

      const res = enterType == 1 ? await this.postStore.searchHashtags(keywords, true) : await this.postStore.fetchChannelPost(keywords, true)
      // let positions=[]
      // let popups=[]
      // positions = res.map(obj => {if (obj.content && obj.content.geo && obj.content.geo.coordinates){  return obj.content.geo.coordinates }})
      // popups = res.map(obj=> {if (obj.content){  return obj.content.text}})

      const { positions, popups } = res.reduce((acc, obj) => {
        if (obj.content && obj.content.geo && obj.content.geo.coordinates) {
          acc.positions.push(obj.content.geo.coordinates);
        }
        if (obj.content) {
          acc.popups.push(obj.content.text);
        }
        return acc;
      }, { positions: [], popups: [] });
      if (positions.length <= 0)
        showNegative("The " + keywords + " has no results with geolocations!")
      else
        showPositive("Within " + res.length + " posts, only " + positions.length + " of them are with geolocations!")
      this.drawMap(positions, popups)
    },
  },

  computed: {
    count() {
      return usePostStore().getSocketPost
      // Or return basket.getters.fruitsCount
      // (depends on your design decisions).
    }
  },
  watch: {
    '$route.params': {
      handler: async function (v) {
        if (v.keywords) {
          this.keywords = v.keywords
          if (this.mapStore.getMap) {
            this.mapStore.removeAllMarkers()
            this.mapStore.addLayerMarker()
          }
          console.log(v)
          this.fetchSearchResults(v.keywords, 1)
        }
      },
      immediate: true
    },
    count: {
      handler: function (v) {

        if (v.content && v.content.geo && v.content.geo.coordinates) {
          if (v.content.text) {
            const regex = /#\w+/;
            const res = v.content.text.match(regex);
            if (res && res[0] === "#"+this.keywords) {
              // this.mapStore.addMarkerWithPopUp(v.content.geo.coordinates, v.content.text)
              // this.mapStore.addPolyline(positions)
              // this.mapStore.addCustomMarker(this.myPos, "home")
              // this.mapStore.addLayerMarker()
              // this.mapStore.addLayerLine()
              this.mapStore.addDynamicMarker(v.content.geo.coordinates, v.content.text)
              // this.positions.push(v.content.geo.coordinates)
              // this.popups.push(v.content.text)
            }
          }
        }
      },
      deep: true
    }

  },
  async mounted() {
    useSocketStore().startNoLoginSocket()
    // const paramId = this.router.currentRoute.value.params.keywords;
    const routeParams = this.$route.params;

    if (Object.keys(routeParams).length > 0) {
      if (routeParams.keywords) {
        this.keywords = routeParams.keywords;
        this.fetchSearchResults(this.keywords, 1)
        // this.fetchDataForKeywords();
      } else if (routeParams.channels) {
        this.channels = routeParams.channels;
        this.fetchSearchResults(this.channels, 2)
        // this.fetchDataForChannels();
      } else {
      }
    } else {
    }
  },
  unmounted() {
    useSocketStore().startLoggedInSocket()
  },

}
</script>
