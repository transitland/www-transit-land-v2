<template>
  <div>
    <div id="map" ref="mapelem" class="map" />

    <div class="is-hidden-mobile">
      <div class="map-agencies notification">
        <p v-show="Object.keys(agencyFeatures).length == 0">
          <strong>Use your mouse cursor</strong> to highlight routes and see their names here. <strong>Click</strong> to select for more details.
        </p>
        <route-select :agency-features="agencyFeatures" :collapse="true" />
      </div>
    </div>

    <b-modal
      :active.sync="isComponentModalActive"
      :can-cancel="true"
      has-modal-card
      full-screen
    >
      <div v-if="isComponentModalActive" class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">
            Select Route
          </p>
        </header>
        <section class="modal-card-body">
          <route-select :agency-features="agencyFeatures" />
        </section>
      </div>
    </b-modal>
  </div>
</template>

<script>
import routeSelect from '~/components/route-select'
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js')

const headways = {
  high: 300,
  medium: 900,
  low: 1800
}

const colors = {
  active: '#ffff66',
  busoutline: '#ffffff',
  buslow: '#8acaeb',
  busmedium: '#1c96d6',
  rail: '#aaaaaa',
  railoutline: '#ffffff',
  tram: '#ff9966',
  tramoutline: '#ffffff',
  metro: '#ff0000',
  metrooutline: '#ffffff',
  other: '#E6A615',
  stop: '#007cbf'
}

const routelayers = [
  // hitbox / active
  {
    name: 'route-active',
    paint: {
      'line-color': colors.active,
      'line-width': 12,
      'line-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        1.0,
        0.0
      ]
    }
  },
  // RAIL
  {
    name: 'rail-outline',
    filter: ['all', ['==', 'route_type', 2]],
    paint: { 'line-width': 3.0, 'line-gap-width': 1.0, 'line-color': colors.railoutline }
  },
  {
    name: 'rail',
    filter: ['all', ['<', 'route_type', 3]],
    paint: { 'line-width': 3.0, 'line-color': colors.rail }
  },

  // BUS LOW AND UNKNOWN
  {
    name: 'bus-unknown',
    filter: ['all', ['==', 'route_type', 3], ['==', 'headway_secs', 0]],
    paint: { 'line-color': colors.buslow }
  },
  {
    name: 'bus-low',
    filter: ['all', ['==', 'route_type', 3], ['>', 'headway_secs', headways.medium]],
    paint: { 'line-color': colors.buslow }
  },
  // BUS MEDIUM/HIGH
  {
    name: 'bus-medium-outline',
    filter: ['all', ['==', 'route_type', 3], ['<=', 'headway_secs', headways.medium], ['>', 'headway_secs', 0]],
    paint: { 'line-width': 2.0, 'line-gap-width': 1.0, 'line-color': colors.busoutline }
  },
  {
    name: 'bus-medium',
    filter: ['all', ['==', 'route_type', 3], ['<=', 'headway_secs', headways.medium], ['>', 'headway_secs', 0]],
    paint: { 'line-width': 2.0, 'line-color': colors.busmedium }
  },
  // TRAM
  {
    name: 'tram-outline',
    filter: ['all', ['==', 'route_type', 0]],
    paint: { 'line-width': 3.0, 'line-gap-width': 1.0, 'line-color': colors.tramoutline }
  },
  {
    name: 'tram',
    filter: ['all', ['==', 'route_type', 0]],
    paint: { 'line-width': 3.0, 'line-color': ['coalesce', ['get', 'route_color'], colors.tram] }
  },
  // METRO
  {
    name: 'metro-outline',
    filter: ['all', ['==', 'route_type', 1]],
    paint: { 'line-width': 3.0, 'line-gap-width': 1.0, 'line-color': colors.metrooutline }
  },
  {
    name: 'metro',
    filter: ['all', ['==', 'route_type', 1]],
    paint: { 'line-width': 3.0, 'line-color': ['coalesce', ['get', 'route_color'], colors.metro] }
  },
  // OTHER
  {
    name: 'other',
    filter: ['all', ['>', 'route_type', 3]],
    paint: {
      'line-opacity': 1.0,
      'line-width': [
        'step',
        ['get', 'headway_secs'],
        1, 1,
        2, 600,
        1, 1200,
        1
      ],
      'line-color': colors.other
    }
  }
]

/// ///////

export default {
  components: { routeSelect },
  layout: 'map',
  data () {
    return {
      map: null,
      hovering: [],
      isComponentModalActive: false,
      agencyFeatures: {}
    }
  },
  mounted () {
    this.initMap()
  },
  methods: {
    initMap () {
      this.map = new mapboxgl.Map({
        container: this.$refs.mapelem,
        transformRequest: (url, resourceType) => {
          if (resourceType === 'Tile' && url.startsWith('https://transit.land')) {
            return {
              url,
              headers: { apikey: process.env.tileApikey }
            }
          }
        },
        style: {
          version: 8,
          sources: {
            'raster-tiles': {
              type: 'raster',
              tiles: [
                'https://0.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{scale}.png'
              ],
              tileSize: 256,
              attribution:
                        'Transitland | Interline | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>'

            }
          },
          layers: [
            {
              id: 'simple-tiles',
              type: 'raster',
              source: 'raster-tiles',
              minzoom: 0,
              maxzoom: 22
            }
          ]
        },
        hash: true,
        center: [-122.3, 37.8],
        zoom: 8
      })
      this.map.addControl(new mapboxgl.NavigationControl())
      this.map.on('mousemove', this.mapMouseMove)
      // this.map.on('moveend', this.mapMoveEnd)
      this.map.on('load', this.mapLoad)
      this.map.on('click', 'route-active', this.mapClick)
    },
    mapLoad () {
      const map = this.map
      map.addSource('routes', {
        type: 'vector',
        tiles: [
          `${process.env.tileEndpoint}/routes/tiles/{z}/{x}/{y}.pbf`
        ],
        minzoom: 0,
        maxzoom: 14
      }
      )
      for (const v of routelayers) {
        const l = {
          id: v.name,
          type: 'line',
          source: 'routes',
          'source-layer': 'routes',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: v.paint
        }
        if (v.filter != null) {
          l.filter = v.filter
        }
        map.addLayer(l)
      }
      map.addLayer(
        {
          id: 'stops',
          source: {
            type: 'vector',
            tiles: [
              `${process.env.tileEndpoint}/stops/tiles/{z}/{x}/{y}.pbf`
            ],
            minzoom: 14,
            maxzoom: 14
          },
          'source-layer': 'stops',
          type: 'circle',
          paint: {
            'circle-radius': 5,
            'circle-color': colors.stop
          }
        }
      )
    },
    mapClick (e) {
      this.isComponentModalActive = true
    },
    mapMouseMove (e) {
      const map = this.map
      const features = map.queryRenderedFeatures(e.point, { layers: ['route-active'] })
      map.getCanvas().style.cursor = 'pointer'
      for (const k of this.hovering) {
        map.setFeatureState(
          { source: 'routes', sourceLayer: 'routes', id: k },
          { hover: false }
        )
      }
      this.hovering = []
      for (const v of features) {
        this.hovering.push(v.id)
        map.setFeatureState({ source: 'routes', sourceLayer: 'routes', id: v.id }, { hover: true })
      }
      const agencyFeatures = {}
      for (const v of features) {
        const agencyId = v.properties.agency_name
        const routeId = v.properties.route_id
        if (agencyFeatures[agencyId] == null) {
          agencyFeatures[agencyId] = {}
        }
        agencyFeatures[agencyId][routeId] = v.properties
      }
      this.agencyFeatures = agencyFeatures
    },
    mapMoveEnd () {
      const map = this.map
      map.on('moveend', function (e) {
        const count = {}
        const agencies = {}
        for (const f of map.queryRenderedFeatures({ layers: ['route-active'] })) {
          count[f.id] = true
          agencies[f.properties.agency_id] = true
        }
        document.getElementById('summary').innerHTML = `features:, ${Object.keys(count).length} agencies: ${Object.keys(agencies).length}`
      })
    }
  },
  head: {
    title: 'Global Map of Transit Routes'
  }
}
</script>

<style scoped>
#map {
  width: 100%;
  height: calc(100vh - 60px);
}

.map-agencies {
  position:absolute;
  top:80px;
  left:0px;
  background:#ffffff;
  width:400px;
  overflow-x:hidden;
  opacity:0.5;
}
</style>
