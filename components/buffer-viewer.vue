<template>
  <div />
</template>

<script>
import gql from 'graphql-tag'

const q2 = gql`
query ($arg_agency_ids: _int8, $arg_route_ids: _int8, $arg_stop_ids: _int8, $radius: numeric) {
  buffers: tl_calculate_buffers(args: {agency_ids: $arg_route_ids, route_ids: $arg_route_ids, stop_ids: $arg_stop_ids, radius: $radius}) {
    stop_buffer
    stop_points
    stop_convexhull
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
      buffers: []
    }
  },
  apollo: {
    buffers: {
      query: q2,
      variables () {
        const q = {
          radius: this.radius
        }
        if (this.agencyIds) {
          q.arg_agency_ids = `{${this.agencyIds.join(',')}}`
        } else if (this.routeIds) {
          q.arg_route_ids = `{${this.routeIds.join(',')}}`
        } else if (this.stopIds) {
          q.arg_stop_ids = `{${this.stopIds.join(',')}}`
        }
        return q
      }
    }
  },
  computed: {
    bufferFeatures () {
      if (this.$apollo.loading) { return [] }
      const ret = []
      for (const f of this.buffers || []) {
        ret.push({
          type: 'Feature',
          geometry: f.stop_buffer,
          properties: { radius: this.radius }
        })
      }
      return ret
    },
    hullFeatures () {
      if (this.$apollo.loading) { return [] }
      const ret = []
      for (const f of this.buffers || []) {
        ret.push({
          type: 'Feature',
          geometry: f.stop_convexhull,
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
