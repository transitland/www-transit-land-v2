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
import gql from 'graphql-tag'

const q = gql`
query ($limit: Int!, $agency_ids: [Int!], $route_ids: [Int!], $feed_version_sha1: String, $include_stops: Boolean! = false) {
  routes(limit: $limit, ids: $route_ids, where: {agency_ids: $agency_ids, feed_version_sha1: $feed_version_sha1}) {
    id
    onestop_id
    feed_onestop_id
    feed_version_sha1
    route_id
    route_color
    route_desc
    route_long_name
    route_short_name
    route_type
    route_url
    geometry
    headway_seconds_weekday_morning
    route_stops @include(if: $include_stops) {
      stop {
        id
        stop_id
        stop_name
        geometry
      }
    }
    agency {
      id
      agency_id
      agency_name
    }
  }
}
`

export default {
  apollo: {
    routes: {
      query: q,
      error (e) { this.error = e },
      variables () {
        return {
          include_stops: this.includeStops,
          feed_version_sha1: this.feedVersionSha1,
          route_ids: this.routeIds,
          agency_ids: this.agencyIds,
          limit: 10000
        }
      }
    }
  },
  props: {
    feedVersionSha1: { type: String, default: null },
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
            headway_secs: feature.headway_seconds_weekday_morning ? feature.headway_seconds_weekday_morning : -1,
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
