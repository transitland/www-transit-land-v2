<template>
  <div>
    <b-message v-if="error" class="is-danger">
      {{ error }}
    </b-message>
    <span v-else-if="$apollo.loading" class="is-loading">Loading</span>
    <map-viewer
      v-else
      :features="features"
      :route-features="routeFeatures"
      :stop-features="stopFeatures"
      :overlay="overlay"
      :link-version="linkVersion"
    />
  </div>
</template>

<script>
export default {
  apollo: {
    routes: {
      query: require('~/graphql/map-routes.gql'),
      error (e) { this.error = e },
      variables () {
        return {
          include_stops: this.includeStops,
          feed_version_ids: this.fvids,
          route_ids: this.routeIds,
          agency_ids: this.agencyIds,
          offset: 0,
          limit: 10000
        }
      }
    }
  },
  props: {
    includeStops: { type: Boolean, default: false },
    overlay: { type: Boolean, default: false },
    fvids: { type: Array, default: null },
    routeIds: { type: Array, default: null },
    agencyIds: { type: Array, default: null },
    linkVersion: { type: Boolean, default: false },
    features: { type: Array, default () { return [] } }
  },
  data () {
    return {
      routes: [],
      error: null
    }
  },
  computed: {
    routeFeatures () {
      const features = []
      for (const feature of this.routes) {
        if (feature.geometries && feature.geometries.length > 0) {
          let hw = 10000
          if (feature.headways_weekday && feature.headways_weekday.headway_secs) {
            hw = feature.headways_weekday.headway_secs
          }
          let routeColor = feature.route_color
          if (routeColor && routeColor.substr(0, 1) !== '#') {
            routeColor = '#' + routeColor
          }
          features.push({
            id: feature.id,
            properties: {
              class: 'route',
              id: feature.id,
              route_id: feature.route_id,
              onestop_id: feature.onestop_id,
              feed_version_sha1: feature.feed_version_sha1,
              feed_onestop_id: feature.feed_onestop_id,
              route_short_name: feature.route_short_name,
              route_long_name: feature.route_long_name,
              route_type: feature.route_type,
              route_color: routeColor,
              agency_name: feature.agency.agency_name,
              headway_secs: hw,
              geometry_length: 0.0
            },
            geometry: feature.geometries[0].geometry
          })
        }
      }
      return features
    },
    stopFeatures () {
      const features = []
      for (const feature of this.routes) {
        for (const rs of feature.route_stops || []) {
          features.push({
            id: rs.stop.id,
            properties: {
              class: 'stop',
              id: rs.stop.id
            },
            geometry: rs.stop.geometry
          })
        }
      }
      return features
    }
  }
}
</script>
