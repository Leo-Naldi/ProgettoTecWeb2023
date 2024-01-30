<!-- <template>
  <div :id=mapId class="golden-ratio" ></div>
</template>

<script>
import { useMapStore } from 'stores/map.js'
import 'leaflet/dist/leaflet.css'
import L from "leaflet";

export default {
  name: 'ShowMap',
  props: {
    myPosition: {
      type: Object,
      required: true,
    },
    mapId: {
      type: String,
      default:-1
    },
  },
  // setup (props) {
  //   onMounted(async ()=>{
  //     const center = props.myPosition
  //     let my_map = L.map(props.mapId);
  //     L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
  //       attribution:
  //         '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  //     }).addTo(my_map);

  //     const bounds = L.latLngBounds(center, center);
  //     my_map.fitBounds(bounds);

  //     const markers= new L.FeatureGroup()
  //     var marker = L.marker(center)
  //     markers.addLayer(marker)
  //     my_map.addLayer(markers)


  //     // mapStore.initializeMapAndLocator(props.mapId);
  //     // mapStore.setCenter(props.myPosition)
  //     // mapStore.addMarker(props.myPosition)
  //     // mapStore.addLayerMarker()
  //   })
  // },
  // computed:{
  //   computedMap(){

  //   }
  // },
  mounted(){
    var my_map = L.map(this.$props.mapId);
      L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(my_map);
      const center = this.$props.myPosition


      const bounds = L.latLngBounds(center, center);
      my_map.fitBounds(bounds);

      const markers= new L.FeatureGroup()
      var marker = L.marker(center)
      markers.addLayer(marker)
      my_map.addLayer(markers)
  },
}
</script>

<style scoped lang="sass">

.golden-ratio
  width: 100%
  aspect-ratio: 1.618/1
  max-width: calc(90vw - 10px)
  // z-index:1
  // height: calc(100vw / 1.618)
  // height: calc(100vh - 100px)
  // max-width: calc(90v - 10px)
</style>
 -->
 <template>
  <div :id=mapId class="golden-ratio" ></div>
</template>

<script>
import { useMapStore } from 'stores/map.js'
import { onMounted } from 'vue'
import 'leaflet/dist/leaflet.css'
import L from "leaflet";

export default {
  name: 'ShowMap',
  props: {
    myPosition: {
      type: Object,
      required: true,
    },
    mapId: {
      type: String,
    },
  },
  data(){
    return{
      mapInstance: null
    }
  },
  // setup (props) {
  //   onMounted(async ()=>{
  //     const center = props.myPosition
  //     let my_map = L.map(props.mapId);
  //     L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
  //       attribution:
  //         '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  //     }).addTo(my_map);

  //     const bounds = L.latLngBounds(center, center);
  //     my_map.fitBounds(bounds);

  //     const markers= new L.FeatureGroup()
  //     var marker = L.marker(center)
  //     markers.addLayer(marker)
  //     my_map.addLayer(markers)


  //     // mapStore.initializeMapAndLocator(props.mapId);
  //     // mapStore.setCenter(props.myPosition)
  //     // mapStore.addMarker(props.myPosition)
  //     // mapStore.addLayerMarker()
  //   })
  // },
  mounted(){
    var container = L.DomUtil.get(this.$props.mapId);
      if(container != null){
        container._leaflet_id = null;
      }
    const center = this.$props.myPosition
      var my_map = L.map(this.$props.mapId);
      L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(my_map);

      const bounds = L.latLngBounds(center, center);
      my_map.fitBounds(bounds);

      const markers= new L.FeatureGroup()
      var marker = L.marker(center)
      markers.addLayer(marker)
      my_map.addLayer(markers)
      this.mapInstance=my_map
      // useMapStore().resetMap()
      // useMapStore().initializeMapAndLocator(this.$props.mapId);
      // useMapStore().setCenter(this.$props.myPosition)
      // useMapStore().addMarker(this.$props.myPosition)
      // useMapStore().addLayerMarker()
  },
  // unmounted() {
  //   if (this.mapInstance) {
  //     this.mapInstance.remove();
  //   }
  // },
}
</script>

<style scoped lang="sass">

.golden-ratio
  width: 100%
  aspect-ratio: 1.618/1
  max-width: calc(90vw - 10px)
  // z-index:1
  // height: calc(100vw / 1.618)
  // height: calc(100vh - 100px)
  // max-width: calc(90v - 10px)
</style>
