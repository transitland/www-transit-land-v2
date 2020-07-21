<template>
  <div>
    <span v-if="mapFeatures.length === 0">Loading</span>
    <map-viewer v-else :features="mapFeatures" :overlay="overlay" />
  </div>
</template>

<script>
import MapViewer from '~/components/map-viewer'

export default {
  apollo: {
    features: {
      query: require('~/graphql/map-routes.gql'),
      variables () {
        return {
          feed_version_id: this.fvid,
          route_id: this.routeId,
          agency_id: this.agencyId,
          offset: 0,
          limit: 10000
        }
      }
    }
  },
  components: { MapViewer },
  props: {
    overlay: { type: Boolean, default: false },
    fvid: { type: Number, default: null },
    routeId: { type: Number, default: null },
    agencyId: { type: Number, default: null }
  },
  data () {
    return {
      features: []
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
              feed_version_sha1: this.$route.params.version,
              onestop_id: this.$route.params.feed,
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
