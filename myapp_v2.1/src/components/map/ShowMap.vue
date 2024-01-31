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
  },
}
</script>

<style scoped lang="sass">

.golden-ratio
  width: 100%
  aspect-ratio: 1.618/1
  max-width: calc(90vw - 10px)
</style>
