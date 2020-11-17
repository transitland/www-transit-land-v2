<template>
  <div>
    <!-- This component is to glue together a map and data exporter -->
    <feed-version-map-viewer
      :features="features"
      :agency-ids="agencyIds"
      :overlay="true"
      :link-version="linkVersion"
      @setRouteFeatures="routeFeatures = $event"
      @setStopFeatures="stopFeatures = $event"
    />

    <br>

    <data-export
      :agency-ids="agencyIds"
      :route-features="routeFeatures"
      :stop-features="stopFeatures"
      @setFeatures="features = $event"
    />
  </div>
</template>

<script>
export default {
  props: {
    agencyIds: { type: Array, default () { return [] } }
  },
  data () {
    return {
      linkVersion: true,
      routes: [],
      stops: [],
      features: [],
      routeFeatures: [],
      stopFeatures: []
    }
  }
}
</script>
