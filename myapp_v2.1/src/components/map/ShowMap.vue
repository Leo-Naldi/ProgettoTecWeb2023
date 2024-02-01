 <template>
  <div :id=mapId class="golden-ratio" role="application"
    aria-label="Map showing post location"
    tabindex="0"
     ></div>
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

#mapId:focus
  outline: 2px solid #1da1f2
  outline-offset: 4px
</style>
