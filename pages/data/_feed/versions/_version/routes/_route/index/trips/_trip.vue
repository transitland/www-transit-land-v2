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
export default {
  props: {
    entity: { type: Object, default () { return {} } },
    label: { type: String, default: 'Trip Viewer' },
    serviceDate: { type: String, default: '' }
  },
  computed: {
  },
  mounted () {
    this.$emit('update:label', 'Trip Viewer')
  },
  head () {
    if (this.entity) {
      return {
        title: `trip viewer • ${this.entity.route_long_name} (route) • ${this.entity.agency.agency_name}`
      }
    }
  }
}
</script>
