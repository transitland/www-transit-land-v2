<template>
  <div class="columns">
    <div class="column is-two-fifths">
      <div style="padding:20px">
        {{ count }} Stops
        <template v-if="entities.length != count">
          / {{ entities.length }} filtered
        </template>

        <b-table :data="entities" :columns="columns" />
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
    const initlocation = { type: 'Polygon', coordinates: [[[-122.36889839172365, 47.579536520842055], [-122.30298042297365, 47.579536520842055], [-122.30298042297365, 47.625834810279464], [-122.36889839172365, 47.625834810279464], [-122.36889839172365, 47.579536520842055]]] }
    this.initMap()
    this.load(initlocation)
  },
  validate ({ params }) {
    return true
  },
  methods: {
    load (bbox) {
      this.$apollo
        .query({
          query: require('~/graphql/active_stops.gql'),
          variables: { geometry: bbox }
        })
        .then((response) => {
          this.count = 0 // response.data.count.aggregate.count
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
      const layer = L.featureGroup(circles).addTo(this.map)
      if (this.layer == null) {
        this.map.fitBounds(layer.getBounds())
        this.map.on('moveend', this.updateBbox)
        this.map.on('zoomend', this.updateBbox)
      }
      this.layer = layer
    }
  },
  apolloProvider
}
</script>
