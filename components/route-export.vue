<template>
  <div>
    <div>
      <b-field grouped>
        <b-field label="Stop Buffer Radius (m)" expanded style="margin-right:50px">
          <b-slider
            v-model="radius"
            size="is-medium"
            :min="0"
            :max="2000"
            :step="100"
            ticks
            lazy
          >
            <template v-for="val in [400,1000,2000]">
              <b-slider-tick :key="val" :value="val">
                {{ val }}
              </b-slider-tick>
            </template>
          </b-slider>
        </b-field>

        <b-field label="Summary Level" expanded>
          <b-select v-model="layer">
            <option v-for="(v,k) of layerInfo" :key="k" :value="k">
              {{ v.name }}
            </option>
          </b-select>
        </b-field>

        <b-field label="Show on Map" expanded>
          <b-dropdown
            v-model="showOnMap"
            multiple
            aria-role="list"
          >
            <button slot="trigger" class="button" type="button">
              <span>
                {{ showOnMap.map((s)=>{return titleize(s)}).join(", ") }}
              </span>
              <b-icon icon="menu-down" />
            </button>

            <b-dropdown-item value="buffer" aria-role="listitem">
              <span>Stop Buffer</span>
            </b-dropdown-item>

            <b-dropdown-item value="hull" aria-role="listitem">
              <span>Stop Hull</span>
            </b-dropdown-item>

            <b-dropdown-item value="census" aria-role="listitem">
              <span>Census Geographies</span>
            </b-dropdown-item>
          </b-dropdown>
        </b-field>
      </b-field>
    </div>

    <br>

    <div v-if="$apollo.loading">
      Loading...
    </div>
    <div v-else>
      <b-field grouped>
        <b-field label="Download GeoJSON">
          <geojson-downloader v-if="routeFeatures.length > 0" :features="routeFeatures" label="Route" :filename="routeName" />
          <geojson-downloader v-if="stopFeatures.length > 0" :features="stopFeatures" label="Stops" :filename="routeName + ' - Stops'" />
          <geojson-downloader v-if="bufferFeatures.length > 0" :features="bufferFeatures" label="Stop Buffer" :filename="routeName + ' - Stop Buffer'" />
          <geojson-downloader v-if="hullFeatures.length > 0" :features="hullFeatures" label="Stop Hull" :filename="routeName + '- Stop Hull'" />
          <geojson-downloader v-if="censusFeatures.length > 0" :features="censusFeatures" label="Census Geographies" :filename="routeName + '- Census Geographies'" />
        </b-field>
      </b-field>
    </div>

    <br>

    <buffer-viewer :route-ids="routeIds" :radius="radius" @setBufferFeatures="bufferFeatures = $event" @setHullFeatures="hullFeatures = $event" />
    <census-viewer :route-ids="routeIds" :radius="radius" :layer="layer" @setFeatures="censusFeatures = $event" />
  </div>
</template>

<script>

export default {
  props: {
    routeName: { type: String, default: 'export' },
    stopIds: { type: Array, default () { return null } },
    routeIds: { type: Array, default () { return null } },
    agencyIds: { type: Array, default () { return null } },
    routeFeatures: { type: Array, default () { return [] } },
    stopFeatures: { type: Array, default () { return [] } }
  },
  data () {
    return {
      showOnMap: ['census', 'hull', 'buffer'],
      censusFeatures: [],
      bufferFeatures: [],
      hullFeatures: [],
      radius: 400.0,
      layer: 'tract',
      layerInfo: {
        tract: { name: 'Tract', plural: 'Tracts' },
        county: { name: 'County', plural: 'Counties' },
        bg: { name: 'Block Group', plural: 'Block Groups' }
        // state: { name: 'State', plural: 'States' },
        // city: { name: 'City (Census Designated Place)', plural: 'Cities' },
        // cd: { name: 'Congressional District', plural: 'Congressional Districts' }
      }
    }
  },
  computed: {
    features () {
      if (this.$apollo.loading) { return [] }
      let ret = []
      if (this.showOnMap.includes('buffer')) {
        ret = ret.concat(this.bufferFeatures)
      }
      if (this.showOnMap.includes('hull')) {
        ret = ret.concat(this.hullFeatures)
      }
      if (this.showOnMap.includes('census')) {
        ret = ret.concat(this.censusFeatures)
      }
      return ret
    }
  },
  watch: {
    features () {
      this.$emit('setFeatures', this.features)
    }
  },
  methods: {
    titleize (s) {
      return s.substr(0, 1).toUpperCase() + s.substr(1)
    }
  }
}
</script>
