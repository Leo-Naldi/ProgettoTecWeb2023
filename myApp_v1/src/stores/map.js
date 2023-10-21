import { defineStore } from "pinia";
import L, { Map } from "leaflet";
import "leaflet/dist/leaflet.css";

export const useMapStore = defineStore("map", {
  state: () => ({
    map: null,
    center: [46.05, 11.05],
    markers: new L.FeatureGroup(),
    lines: new L.FeatureGroup()
  }),

  getters: {
    getMap:(state)=>state.map
  },

  actions: {
    initializeMapAndLocator(mapId) {
      // this.map = L.map(mapId).setView([46.05, 11.05], 5);
      this.map = L.map(mapId);
      L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);
    },
    getCurrentLocation() {
      navigator.geolocation.getCurrentPosition((position) => {
        this.center = [position.coords.latitude, position.coords.longitude];
      });
      return this.center;
    },

    setCenter(center) {
      if (center) {
        this.center = center;
      } else {
        this.center = this.getCurrentLocation();
      }
      const bounds = L.latLngBounds(center, center);
      this.map.fitBounds(bounds);
      // console.log(center)
      // this.map.setView(center, 5);
    },
    /*  TODO:
    setLineCenter(positions){
      const bounds = L.latLngBounds(center, center);
      this.map.fitBounds(bounds);
    }, */

    // add a default marker
    addMarker(center) {
      // L.marker(center).addTo(this.map);
      var marker = L.marker(center)
      this.markers.addLayer(marker)
    },
    // add custom icon (from material-icons)
    addCustomMarker(latlng, iconName) {
      const iconUrl = `https://fonts.gstatic.com/s/i/materialicons/${iconName}/v15/24px.svg`;
      const customIcon = L.icon({
        iconUrl,
        iconSize: [24, 24],
        // iconAnchor: [12, 24],
      });
      var marker = L.marker(latlng, { icon: customIcon })
      this.markers.addLayer(marker)
      // L.marker(latlng, { icon: customIcon }).addTo(this.map);
    },
    addLayer(){
      this.map.addLayer(this.markers)
      this.map.addLayer(this.lines)
    },
    addMarkers(positions) {
      const bounds = L.latLngBounds();
      for (let marker of positions) {
        this.addMarker(marker);
        bounds.extend(marker);
      }
      this.map.fitBounds(bounds);
    },
    removeAllMarkers(){
      if (this.map!=null){
      this.map.removeLayer(this.markers);
      this.map.removeLayer(this.lines);
      }
    },
    // TODO:add a line
    addPolyline(positions){
      var line = L.polyline(positions, {
        color: "#4285F4",
      })
      this.lines.addLayer(line)
      // L.polyline(positions, {
      //   color: "#4285F4",
      // }).addTo(this.map);
    },
  },
});
