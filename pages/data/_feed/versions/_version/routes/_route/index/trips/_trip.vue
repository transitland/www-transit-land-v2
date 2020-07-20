<template>
  <div>
    <trip-stop-time-viewer
      :fvid="entity.feed_version_id"
      :route-id="entity.id"
      :trip-id="$route.params.trip"
      :service-date="serviceDate"
    />
  </div>
</template>

<script>
import TripStopTimeViewer from '~/components/trip-stop-time-viewer'

export default {
  components: {
    TripStopTimeViewer
  },
  props: {
    entity: { type: Object, default () { return {} } },
    label: { type: String, default: 'Trip Viewer' },
    serviceDate: { type: String, default: '' }
  },
  computed: {
  },
  mounted () {
    this.$emit('update:label', 'Trip Viewer')
  }
}
</script>
