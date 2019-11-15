<template>
  <section class="section">
    <div ref="mapelem" class="map"></div>
  </section>
</template>

<script>
import L from "leaflet";
import apolloProvider from "../graphql";

export default {
  name: "Home",
  data() {
    return {
      map: null,
      active_stops: null
    };
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      console.log("ok");
      this.map = L.map(this.$refs.mapelem, {
        scrollWheelZoom: false,
        attributionControl: false
      }).setView([37.781555, -122.39399], 12);
      L.control.attribution({ prefix: null }).addTo(this.map);
      this.tileLayer = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{scale}.png",
        {
          attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
          scale: "@2x",
          maxZoom: 14
        }
      );
      this.tileLayer.addTo(this.map);

      this.map.on('dragend', ()=>{
        this.dragend();
      });
      this.$nextTick(() => {
        // map initialized
        this.loadStops(null);
      });
    },
    dragend() {
      var b = this.map.getBounds();
      var coords = [[
        [b.getWest(), b.getSouth()],
        [b.getEast(), b.getSouth()],
        [b.getEast(), b.getNorth()],
        [b.getWest(), b.getNorth()],
        [b.getWest(), b.getSouth()],
      ]];
      this.loadStops({type: "Polygon", coordinates: coords});
    },
    loadStops(geometry) {
      console.log(JSON.stringify(geometry));
      this.$apollo
        .query({
          query: require("../graphql/active_stops.gql"),
          variables: {
            geometry: geometry
          }
        })
        .then(response => {
          this.displayStops(response.data.active_stops);
        });
    },
    displayStops(stops) {
      this.active_stops = stops;
      this.active_stops.forEach((stop)=>{
        var circle = L.circle([stop.geometry.coordinates[1], stop.geometry.coordinates[0]], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 1
        }).addTo(this.map);
      })
    }
  },
  apolloProvider
};
</script>

<style scoped>
.feedbox {
  border: solid 1px #ccc;
  padding: 5px;
  margin: 5px;
}
.map {
  width: 500px;
  height: 500px;
}
</style>