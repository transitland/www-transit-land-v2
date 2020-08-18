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
import mapLayers from '~/plugins/map-layers.js'
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js')

/// ///////

export default {
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
                'https://0.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{scale}.png'
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
      for (const v of mapLayers.routelayers) {
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
          l.filter = v.filter.slice()
          l.filter.push(['==', 'generated', false])
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
            'circle-color': mapLayers.colors.stop
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
  head () {
    return {
      title: 'Global Map of Transit Routes'
    }
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
