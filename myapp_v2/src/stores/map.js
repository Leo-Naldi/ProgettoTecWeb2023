import { defineStore } from "pinia";
import L from "leaflet";
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
    initializeMapAndLocator() {
      if(this.map==null){
      this.map = L.map("MapPage");
      L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);
    }
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
    },
    addMarker(center) {
      // L.marker(center).addTo(this.map);
      var marker = L.marker(center)
      this.markers.addLayer(marker)
    },
    addMarkerWithPopUp(center, popup){
      var marker = L.marker(center).bindPopup(popup)
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
    addLayerMarker(){
      this.map.addLayer(this.markers)
    },
    addLayerLine(){
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
    addMarkersWithPopUp(positions, popups){
      const bounds = L.latLngBounds();
      for (var i in positions) {
        this.addMarkerWithPopUp(positions[i], popups[i]);
        bounds.extend(positions[i]);
      }
      this.map.fitBounds(bounds);
    },
    removeAllMarkers(){
      this.map.removeLayer(this.markers);
      this.map.removeLayer(this.lines);
      this.markers= new L.FeatureGroup()
      this.lines= new L.FeatureGroup()
    },
    resetMap(){
      if (this.map!=null){
        this.map.remove()
        this.map=null
      }
    },
    addPolyline(positions){
      var line = L.polyline(positions, {
        color: "#4285F4",
      })
      this.lines.addLayer(line)
    },
    addDynamicMarker(center, popup="") {
      var marker = popup? L.marker(center).bindPopup(popup): L.marker(center);
      this.markers.addLayer(marker);

      if (this.lines.getLayers().length > 0) {
        const lastLine = this.lines.getLayers()[this.lines.getLayers().length - 1];
        const lastLatLng = lastLine.getLatLngs()[lastLine.getLatLngs().length - 1];
        const line = L.polyline([lastLatLng, center], {
          color: "#4285F4",
        });
        this.lines.addLayer(line);
        // this.addPolyline([lastLatLng, center])
      }
    },

    addDynamicLine(positions) {
      const bounds = L.latLngBounds();

      for (let i = 0; i < positions.length; i++) {
        const position = positions[i];
        this.addMarker(position); // 添加标记
        bounds.extend(position);

        if (i > 0) {
          this.addPolyline([positions[i - 1], position])
        }
      }

      if (this.lines.getLayers().length > 0) {
        const lastLine = this.lines.getLayers()[this.lines.getLayers().length - 1];
        const lastLatLng = lastLine.getLatLngs()[lastLine.getLatLngs().length - 1];
        this.addPolyline([lastLatLng, positions[positions.length - 1]])
      }

      this.map.fitBounds(bounds);
    },
  },
});
