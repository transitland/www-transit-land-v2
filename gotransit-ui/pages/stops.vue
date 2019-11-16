<template>
  <section class="section">
    Stops on map: {{ (activeStops || []).length }}
    <div ref="mapelem" class="map" />
  </section>
</template>

<script>
import L from 'leaflet'
import apolloProvider from '../graphql'

export default {
  name: 'Home',
  data () {
    return {
      map: null,
      activeStops: null
    }
  },
  mounted () {
    this.initMap()
  },
  methods: {
    initMap () {
      console.log('ok')
      this.map = L.map(this.$refs.mapelem, {
        preferCanvas: true,
        scrollWheelZoom: false,
        attributionControl: false
      }).setView([37.781555, -122.39399], 14)
      L.control.attribution({ prefix: null }).addTo(this.map)
      this.tileLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{scale}.png',
        {
          attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
          scale: '@2x',
          maxZoom: 14
        }
      )
      this.tileLayer.addTo(this.map)
      this.map.on('resize', this.dragend)
      this.map.on('viewreset', this.dragend)
      this.map.on('moveend', this.dragend)
      this.map.on('zoomend', this.dragend)
      this.$nextTick(() => {
        this.dragend()
      })
    },
    dragend () {
      const b = this.map.getBounds()
      const coords = [[
        [b.getWest(), b.getSouth()],
        [b.getEast(), b.getSouth()],
        [b.getEast(), b.getNorth()],
        [b.getWest(), b.getNorth()],
        [b.getWest(), b.getSouth()]
      ]]
      this.loadStops({ type: 'Polygon', coordinates: coords })
    },
    loadStops (geometry) {
      this.$apollo
        .query({
          query: require('../graphql/active_stops.gql'),
          variables: {
            geometry
          }
        })
        .then((response) => {
          this.displayStops(response.data.active_stops)
        })
    },
    displayStops (stops) {
      this.activeStops = stops
      this.activeStops.forEach((stop) => {
        L.circle([stop.geometry.coordinates[1], stop.geometry.coordinates[0]], {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.5,
          radius: 1
        }).addTo(this.map)
      })
    }
  },
  apolloProvider
}
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
