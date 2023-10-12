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
      type: [Number, Array],
      required: true,
      default: () => [0, 0],
    },
    positions: {
      type: Object,
    },
    createdAt: {
      type: [String, Array],
      default: () => [""],
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
      mapStore.addMarker(props.myPosition)
      // mapStore.addCustomMarker(props.myPosition, "home")
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
  // height: calc(100vw / 1.618)
  aspect-ratio: 1.618/1
  max-width: calc(90vw - 10px)
  // max-width: calc(90vw - 10px)
// style="width:100%;height: calc(100vh - 100px); z-index:1;"
</style>
