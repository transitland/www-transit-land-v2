<script>
import L from 'leaflet'

export default {
  methods: {
    updateBbox () {
      const b = this.map.getBounds()
      const coords = [[
        [b.getWest(), b.getSouth()],
        [b.getEast(), b.getSouth()],
        [b.getEast(), b.getNorth()],
        [b.getWest(), b.getNorth()],
        [b.getWest(), b.getSouth()]
      ]]
      this.load({ type: 'Polygon', coordinates: coords })
    },
    initMap () {
      this.map = L.map(this.$refs.mapelem, {
        preferCanvas: true,
        scrollWheelZoom: false
      })
      this.map.fitWorld()
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
    }
  }
}
</script>

<style scoped>
.map {
  position: fixed;
  width: 60%;
  height: 800px;
}
</style>
