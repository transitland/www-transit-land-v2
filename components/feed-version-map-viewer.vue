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
        if (feature.geometry) {
          let routeColor = feature.route_color
          if (routeColor && routeColor.substr(0, 1) !== '#') {
            routeColor = '#' + routeColor
          }
          const fcopy = Object.assign({}, feature, {
            geometry_length: -1,
            route_color: routeColor,
            headway_secs: (feature.headways_weekday && feature.headways_weekday.headway_secs) ? feature.headways_weekday.headway_secs : -1,
            agency_name: feature.agency ? feature.agency.agency_name : null
          })
          delete fcopy.geometry
          delete fcopy.__typename
          features.push({
            id: feature.id,
            type: 'Feature',
            properties: fcopy,
            geometry: feature.geometry
          })
        }
      }
      return features
    },
    stopFeatures () {
      const features = []
      for (const feature of this.routes) {
        for (const g of feature.route_stops || []) {
          const fcopy = Object.assign({}, g.stop)
          delete fcopy.geometry
          delete fcopy.__typename
          features.push({
            type: 'Feature',
            geometry: g.stop.geometry,
            properties: fcopy,
            id: g.stop.id
          })
        }
      }
      return features
    }
  },
  watch: {
    routeFeatures (v) {
      this.$emit('setRouteFeatures', v)
    },
    stopFeatures (v) {
      this.$emit('setSopFeatures', v)
    }
  }
}
</script>
