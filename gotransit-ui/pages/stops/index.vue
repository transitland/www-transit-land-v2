<template>
  <div class="columns">
    <div class="column is-two-fifths">
      <div style="padding:20px">
        {{ count }} Stops
        <template v-if="entities.length != count">
          / {{ entities.length }} filtered
        </template>
      </div>
    </div>
    <div class="column">
      <div ref="mapelem" class="map" />
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import apolloProvider from '~/graphql'
import mapMixin from '~/components/map'

export default {
  layout: 'map',
  mixins: [mapMixin],
  data () {
    return {
      entities: [],
      count: 0,
      layer: null,
      columns: [
        {
          field: 'stop_name',
          label: 'Stop Name'
        }
      ]
    }
  },
  mounted () {
    const initlocation = {
      type: 'Polygon',
      coordinates: [
        [
          [-122.58819580078126, 37.520618678869305],
          [-122.06085205078126, 37.520618678869305],
          [-122.06085205078126, 37.95502661288625],
          [-122.58819580078126, 37.95502661288625],
          [-122.58819580078126, 37.520618678869305]
        ]
      ]
    }
    this.initMap()
    this.load(initlocation)
  },
  methods: {
    load (bbox) {
      this.$apollo
        .query({
          query: require('~/graphql/active_stops.gql'),
          variables: { geometry: bbox }
        })
        .then((response) => {
          this.count = 0
          this.entities = response.data.entities
          this.draw()
        })
    },
    draw () {
      const circles = []
      this.entities.forEach((ent) => {
        const coords = ent.geometry.coordinates
        circles.push(
          L.circle([coords[1], coords[0]], {
            color: 'blue',
            opacity: 0.5,
            radius: 2
          }).bindPopup(ent.stop_name)
        )
      })
      if (this.layer) {
        this.layer.clearLayers()
        // this.layer.addLayer(circles)
        circles.forEach((c) => {
          this.layer.addLayer(c)
        })
      } else {
        this.layer = L.featureGroup(circles).addTo(this.map)
        // this.map.fitBounds(this.layer.getBounds())
        this.map.on('moveend', this.updateBbox)
        this.map.on('zoomend', this.updateBbox)
      }
    }
  },
  apolloProvider
}
</script>
