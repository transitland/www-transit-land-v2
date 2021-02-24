<template>
  <div style="position:relative">
    <client-only>
      <map-viewer
        :show-generated="true"
        :show-long-generated="false"
        :route-tiles="routeTiles"
        :stop-tiles="stopTiles"
        :overlay="true"
        :zoom="1.5"
        :center="[-119.49,12.66]"
        :hash="true"
        :show-options="true"
        map-class="tall"
      />
    </client-only>
  </div>
</template>

<script>

/// ///////

export default {
  layout: 'map',
  data () {
    return {
      routeTiles: {
        id: 'routes',
        url: `${this.$config.tileEndpoint}/routes/tiles/{z}/{x}/{y}.pbf`,
        minzoom: 0,
        maxzoom: 14
      },
      stopTiles: {
        id: 'stops',
        url: `${this.$config.tileEndpoint}/stops/tiles/{z}/{x}/{y}.pbf`,
        minzoom: 14,
        maxzoom: 14
      }
    }
  },
  head () {
    return {
      title: 'Global Transit Map',
      meta: [
        { hid: 'description', name: 'description', content: 'The global transit map provides an interactive view across thousands of bus, train, ferry, cablecar, and funicular routes and the stops they serve. Powered by the Transitland v2 Vector Tiles API.' }
      ]
    }
  }
}
</script>
