<template>
  <div :id=mapId class="golden-ratio" ></div>
</template>

<script>
import { useMapStore } from 'stores/map.js'
import { onMounted } from 'vue'
import 'leaflet/dist/leaflet.css'

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
  setup (props) {
    const mapStore = useMapStore()
    onMounted(()=>{
      mapStore.initializeMapAndLocator(props.mapId);
      mapStore.setCenter(props.myPosition)
      // mapStore.setCenter(props.positions[props.positions.length/2])
      mapStore.addMarker(props.myPosition)
      // mapStore.addCustomMarker(props.myPosition, "home")
      mapStore.addLayerMarker()
    })

    return {
      mapStore,
    }
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
