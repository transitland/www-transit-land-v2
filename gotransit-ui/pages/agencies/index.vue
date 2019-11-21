<template>
  <div class="columns">
    <div class="column is-two-fifths">
      <div style="padding:20px">
        {{ count }} Agencies
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
          field: 'agency_name',
          label: 'Agency Name',
          width: 200
        }
      ]
    }
  },
  mounted () {
    const initlocation = { 'type': 'Polygon', 'coordinates': [[[-123.22373986244203, 36.89701428965626], [-121.11436486244203, 36.89701428965626], [-121.11436486244203, 38.63386045533023], [-123.22373986244203, 38.63386045533023], [-123.22373986244203, 36.89701428965626]]] }
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
          query: require('~/graphql/active_agencies.gql'),
          variables: { geometry: bbox }
        })
        .then((response) => {
          this.count = response.data.count.aggregate.count
          this.entities = response.data.entities
          this.draw()
        })
    },
    draw () {
      const circles = []
      this.entities.forEach((ent) => {
        const fs = ent.agency_geometry
        if (fs && fs.centroid) {
          const coords = fs.centroid.coordinates
          circles.push(
            L.circle([coords[1], coords[0]], {
              color: 'blue',
              opacity: 0.5,
              radius: 2
            }).bindPopup(ent.onestop_id)
          )
        }
      })
      const layer = L.featureGroup(circles).addTo(this.map)
      if (this.layer === null) {
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
