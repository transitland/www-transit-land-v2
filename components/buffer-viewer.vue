<template>
  <div />
</template>

<script>
import gql from 'graphql-tag'

const q = gql`
query ($route_ids: [Int!], $radius: Float!) {
  routes: routes(ids: $route_ids) {
    id
    route_stop_buffer(radius: $radius) {
      stop_points
      stop_buffer
      stop_convexhull
    }
  }
}
`

export default {
  props: {
    radius: { type: Number, default: 400 },
    stopIds: { type: Array, default () { return null } },
    routeIds: { type: Array, default () { return null } },
    agencyIds: { type: Array, default () { return null } }
  },
  data () {
    return {
      routes: []
    }
  },
  apollo: {
    routes: {
      query: q,
      variables () {
        return {
          radius: this.radius,
          route_ids: this.routeIds
        }
      }
    }
  },
  computed: {
    bufferFeatures () {
      if (this.$apollo.loading) { return [] }
      const ret = []
      for (const route of this.routes || []) {
        if (!route.route_stop_buffer) {
          continue
        }
        ret.push({
          type: 'Feature',
          geometry: route.route_stop_buffer.stop_buffer,
          properties: { radius: this.radius }
        })
      }
      return ret
    },
    hullFeatures () {
      if (this.$apollo.loading) { return [] }
      const ret = []
      for (const route of this.routes || []) {
        if (!route.route_stop_buffer) {
          continue
        }
        ret.push({
          type: 'Feature',
          geometry: route.route_stop_buffer.stop_convexhull,
          properties: {}
        })
      }
      return ret
    }
  },
  watch: {
    bufferFeatures () {
      this.$emit('setBufferFeatures', this.bufferFeatures)
    },
    hullFeatures () {
      this.$emit('setHullFeatures', this.hullFeatures)
    }
  }
}
</script>
