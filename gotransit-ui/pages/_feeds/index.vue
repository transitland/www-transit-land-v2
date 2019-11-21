<template>
  <div class="columns">
    <div class="column is-two-fifths">
      <div style="padding:20px">
        {{ count }} Feeds
        <template v-if="ents.length != count">
          / {{ ents.length }} filtered
        </template>

        <b-table :data="ents" :columns="columns">
          <template slot-scope="props">
            <b-table-column field="onestop_id" label="ID">
              {{ props.row.onestop_id }}
            </b-table-column>
            <b-table-column field="feed_version_count" label="Versions" width="20">
              {{ props.row.feed_versions_aggregate.aggregate.count }}
            </b-table-column>
          </template>
        </b-table>
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
      ents: [],
      count: 0,
      layer: null,
      columns: [
        {
          field: 'onestop_id',
          label: 'Feed ID',
          width: 200
        }
      ]
    }
  },
  mounted () {
    this.initMap()
    this.load()
    this.map.on('moveend', this.updateBbox)
    this.map.on('zoomend', this.updateBbox)
  },
  validate ({ params }) {
    return true
  },
  methods: {
    load (bbox) {
      this.$apollo
        .query({
          query: require('~/graphql/current_feeds.gql'),
          variables: { geometry: bbox }
        })
        .then((response) => {
          this.count = response.data.current_feeds_aggregate.aggregate.count
          this.ents = response.data.current_feeds
          this.draw()
        })
    },
    draw () {
      const circles = []
      this.ents.forEach((ent) => {
        const fs = ent.feed_state.feed_version
        if (fs && fs.geometry) {
          const coords = fs.geometry.centroid.coordinates
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
      this.layer = layer
    }
  },
  apolloProvider
}
</script>
