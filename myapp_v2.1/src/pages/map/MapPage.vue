<style scoped lang="sass">
.full-map
  width: 80vw
  height: 80vh
</style>

<template>
  <div id="MapPage" class="full-map"></div>
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

      /*
        先找到所有有 hashtag 的，然后过滤出所有有地理位置的
      */
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
      console.log("找到的带地图的结果是：", res, positions)
      if (positions.length <= 0)
        showNegative("The " + keywords + " has no results with geolocations!")
      else
        showPositive("Within " + res.length + " posts, only " + positions.length + " of them are with geolocations!")
      this.drawMap(positions, popups)
    },
  },

  // 需要监听因为同个页面跳转 mounted 不会再次调用
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
        console.log("【MapPage】 监听 socket_posts 的变化！", v, v.content)
        // 查看 dest 里是否有当前的名字

        if (v.content && v.content.geo && v.content.geo.coordinates) {
          if (v.content.text) {
            const regex = /#\w+/;
            const res = v.content.text.match(regex);
            console.log("匹配结果为；", res[0], "#"+this.keywords, res && res[0] === "#"+this.keywords)
            if (res && res[0] === "#"+this.keywords) {
              // this.mapStore.addMarkerWithPopUp(v.content.geo.coordinates, v.content.text)
              // this.mapStore.addPolyline(positions)
              // this.mapStore.addCustomMarker(this.myPos, "home")
              // this.mapStore.addLayerMarker()
              // this.mapStore.addLayerLine()
              this.mapStore.addDynamicMarker(v.content.geo.coordinates, v.content.text)
              // this.positions.push(v.content.geo.coordinates)
              // this.popups.push(v.content.text)
              console.log("对了！！！")
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
    // 获取路由参数
    const routeParams = this.$route.params;

    if (Object.keys(routeParams).length > 0) {
      if (routeParams.keywords) {                     // 是通过传递关键字进入地图页面
        this.keywords = routeParams.keywords;
        console.log("获取到的是关键字：", this.keywords)
        this.fetchSearchResults(this.keywords, 1)
        // this.fetchDataForKeywords();
      } else if (routeParams.channels) {              // 是通过频道名进入地图页面
        this.channels = routeParams.channels;
        console.log("获取到的是频道名：", this.channels)
        this.fetchSearchResults(this.channels, 2)
        // this.fetchDataForChannels();
      } else {
        // 处理其他情况
      }
    } else {                                          // 是直接进入频道页面
      // 处理不带参数的情况
      console.log("是通过没有参数的方式进来的")
    }
    /*     this.notificationStore.set_realtime_keyword(paramId)
        if (paramId){
          await this.fetchSearchResults(paramId)
        } */
  },
  unmounted() {
    useSocketStore().startLoggedInSocket()
  },

}
</script>
