<template>
  <q-page padding>
    <!-- content -->
    <p>获取用户hanle 从 store 和 localStorage: {{testStoreUser  }}</p>
    <!-- {{ all_posts }} -->
    <!-- <p>all channel：{{ all_channels }}</p> -->
    <!-- <p>{{ value }}</p> -->
    <!-- <q-btn @click="Asocket()">dd</q-btn> -->
    <!-- <div style="height: calc(100vh - 50px)">
      <GMapMap
        :center="center"
        :zoom="10"
      />
    </div> -->
    <!-- <div :id=mapId style="width:100%;height: calc(100vh - 50px); z-index:1;"></div> -->
    <!-- <p>autocomplate channel：{{ all_auto_channels }}</p> -->
    <!-- <p>get daily_news: {{ res_2 }}</p> -->
    <!-- <ShowMap  :mapId="mapId" :my-position="[51,6]"></ShowMap> -->
    <!-- <p>dsjdsagjhdsjgdsgdsgdsgdsgd</p> -->
    <!-- <ShowMap  mapId="my-12345" :my-position="[51.431,6.3512]"></ShowMap> -->
  </q-page>
</template>


<script setup>
import { useUserStore } from 'src/stores/user';
import { computed } from 'vue';

const userStore = useUserStore()
const testStoreUser =computed(()=>userStore.getUser)
</script>


<!-- <script setup>
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
 -->

<!-- // <script>
// import {io} from "socket.io-client";
// import { useAuthStore } from "src/stores/auth";
// import { useUserStore } from "src/stores/user";
// import {useSocketStore} from "src/stores/socket";

// export default {
//   name: 'HomePage',
//   data(){
//     return{
//       mysocket: null,
//       authStore: useAuthStore(),
//       userStore: useUserStore(),
//       socketStore: useSocketStore()
//     }
//   },
  // methods:{
    // setMySocket(){
    //   this.mysocket=io("http://localhost:8000/user-io/fv", {
    //                         extraHeaders: {
    //                             Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoYW5kbGUiOiJmdiIsImFjY291bnRUeXBlIjoidXNlciIsImFkbWluIjpmYWxzZSwiaWF0IjoxNjk4MzI3NDgzLCJleHAiOjE2OTg5MzIyODN9.Me-9vZxyu23RQzDTZht2hdGl4aCIWWu331vkWYjkwPw",
    //                         }
    //                         })
      // io("http://localhost:8000/user-io/fv")
    // }
  // },
  // mounted(){
    // this.setMySocket()
    // console.log(this.mysocket)
    // this.socketStore.setSocket("fv", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoYW5kbGUiOiJmdiIsImFjY291bnRUeXBlIjoidXNlciIsImFkbWluIjpmYWxzZSwiaWF0IjoxNjk4MzI3NDgzLCJleHAiOjE2OTg5MzIyODN9.Me-9vZxyu23RQzDTZht2hdGl4aCIWWu331vkWYjkwPw")
    // console.log(this.socketStore.getSocket)
    // this.authStore.login({"handle":"fv", "password":"12345678"})
  // }
// }
// </script> -->
