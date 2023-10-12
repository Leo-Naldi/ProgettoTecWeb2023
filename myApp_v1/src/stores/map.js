import { defineStore } from "pinia";
import L, { Map } from "leaflet";
import "leaflet/dist/leaflet.css";

export const useMapStore = defineStore("map", {
  state: () => ({
    map: null,
    center: [46.05, 11.05],
  }),

  getters: {
    doubleCount(state) {
      return state.counter * 2;
    },
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
    getCurrentLocation (state) {
      navigator.geolocation.getCurrentPosition((position) => {
        state.center = [
          position.coords.latitude,
          position.coords.longitude,
        ];
      });
      return state.center
    },

    setCenter(center) {
      if (center){
        this.center=center
      }
      else{
        this.center=this.getCurrentLocation()
      }
      const bounds = L.latLngBounds(center, center);
      this.map.fitBounds(bounds);
      // this.map.setView(center);
    },

    // add a default marker
    addMarker(center){
      L.marker(center).addTo(this.map);
    },
    // add custom icon (from material-icons)
    addCustomMarker(latlng, iconName) {
      const iconUrl = `https://fonts.gstatic.com/s/i/materialicons/${iconName}/v15/24px.svg`;
      const customIcon = L.icon({
        iconUrl,
        iconSize: [24, 24],
        // iconAnchor: [12, 24],
      });

      L.marker(latlng, { icon: customIcon }).addTo(this.map);
    },
  },
});
