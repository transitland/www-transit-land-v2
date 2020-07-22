<template>
  <div>
    <b-message v-if="error" class="is-danger">
      {{ error }}
    </b-message>
    <span v-else-if="$apollo.loading" class="is-loading">Loading</span>
    <map-viewer v-else :features="mapFeatures" :overlay="overlay" />
  </div>
</template>

<script>
import MapViewer from '~/components/map-viewer'

export default {
  apollo: {
    features: {
      query: require('~/graphql/map-routes.gql'),
      error (e) { this.error = e },
      variables () {
        return {
          feed_version_ids: this.fvids,
          route_ids: this.routeIds,
          agency_ids: this.agencyIds,
          offset: 0,
          limit: 10000
        }
      }
    }
  },
  components: { MapViewer },
  props: {
    overlay: { type: Boolean, default: false },
    fvids: { type: Array, default: null },
    routeIds: { type: Array, default: null },
    agencyIds: { type: Array, default: null }
  },
  data () {
    return {
      features: [],
      error: null
    }
  },
  computed: {
    mapFeatures () {
      const features = []
      for (const feature of this.features) {
        if (feature.geometries && feature.geometries.length > 0) {
          let hw = 10000
          if (feature.headways_weekday && feature.headways_weekday.headway_seconds_morning_mid) {
            hw = feature.headways_weekday.headway_seconds_morning_mid
          }
          let routeColor = feature.route_color
          if (routeColor && routeColor.substr(0, 1) !== '#') {
            routeColor = '#' + routeColor
          }
          features.push({
            id: feature.id,
            properties: {
              id: feature.id,
              route_id: feature.route_id,
              feed_version_sha1: feature.feed_version.sha1,
              onestop_id: feature.feed_version.current_feed.onestop_id,
              route_short_name: feature.route_short_name,
              route_long_name: feature.route_long_name,
              route_type: feature.route_type,
              route_color: routeColor,
              agency_name: feature.agency.agency_name,
              headway_secs: hw
            },
            geometry: feature.geometries[0].geometry
          })
        }
      }
      return features
    }
  }
}
</script>
