<template>
  <div>
    <div id="mapelem" ref="mapelem" :class="mapClass" />
    <div v-if="overlay" class="is-hidden-mobile">
      <div class="map-agencies notification">
        <div v-if="showOptions" class="map-options">
          <b-dropdown position="is-bottom-right" append-to-body aria-role="menu" trap-focus>
            <span
              slot="trigger"
              class="navbar-item"
              role="button"
            >
              <span>Options</span>
              <b-icon icon="menu-down" />
            </span>

            <b-dropdown-item
              aria-role="menu-item"
              :focusable="false"
              custom
              paddingless
            >
              <div class="modal-card" style="width:300px;">
                <section class="modal-card-body">
                  <div class="field">
                    <b-checkbox v-model="showGeneratedShadow">
                      Show generated geometries
                    </b-checkbox>
                  </div>
                </section>
              </div>
            </b-dropdown-item>
          </b-dropdown>
        </div>
        <div style="padding-left:10px">
          <div v-show="Object.keys(agencyFeatures).length == 0">
            <strong>Use your mouse cursor</strong> to highlight routes and see their names here. <strong>Click</strong> to select for more details.
          </div>
          <route-select :agency-features="agencyFeatures" :collapse="true" />
        </div>
      </div>
    </div>

    <b-modal
      v-if="overlay"
      :active.sync="isComponentModalActive"
      has-modal-card
      full-screen
    >
      <template #default="props">
        <div v-if="isComponentModalActive" class="modal-card" style="width: auto">
          <header class="modal-card-head">
            <p class="modal-card-title">
              Select Route
            </p>
            <button type="button" class="delete" @click="props.close" />
          </header>
          <section class="modal-card-body">
            <route-select :agency-features="agencyFeatures" :link-version="linkVersion" />
          </section>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import mapLayers from '~/plugins/map-layers.js'
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js')

export default {
  props: {
    showOptions: { type: Boolean, default: false },
    showGenerated: { type: Boolean, default: true },
    mapClass: { type: String, default: 'short' },
    routeTiles: { type: Object, default () { return null } },
    stopTiles: { type: Object, default () { return null } },
    stopFeatures: { type: Array, default () { return [] } },
    routeFeatures: { type: Array, default () { return [] } },
    interactive: { type: Boolean, default: true },
    overlay: { type: Boolean, default: false },
    autoFit: { type: Boolean, default: true },
    center: { type: Array, default () { return null } },
    circleRadius: { type: Number, default: 1 },
    circleColor: { type: String, default: '#f03b20' },
    linkVersion: { type: Boolean, default: false },
    zoom: { type: Number, default: 4 },
    hash: { type: Boolean, default: false },
    features: {
      type: Array, default () { return [] }
    }
  },
  data () {
    return {
      map: null,
      hovering: [],
      agencyFeatures: {},
      isComponentModalActive: false,
      showGeneratedShadow: this.showGenerated
    }
  },
  watch: {
    showGeneratedShadow (v) {
      this.updateFilters()
    },
    features (v) {
      if (v) {
        this.$nextTick(() => {
          this.updateFeatures()
        })
      }
    }
  },
  mounted () {
    if (this.features) {
      this.initMap()
    }
  },
  methods: {
    saveImage () {
      const canvas = this.map.getCanvas() // .toDataURL('image/png')
      const fileName = 'image'
      const link = document.createElement('a')
      link.download = fileName + '.png'
      canvas.toBlob(function (blob) {
        link.href = URL.createObjectURL(blob)
        link.click()
      })
    },
    initMap () {
      const opts = {
        hash: this.hash,
        interactive: this.interactive,
        preserveDrawingBuffer: true,
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
              tiles: ['https://0.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{scale}.png'],
              tileSize: 256,
              attribution: 'Transitland | Interline | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>'
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
        }
      }
      if (this.center) {
        opts.center = this.center
      }
      if (this.zoom) {
        opts.zoom = this.zoom
      }
      this.map = new mapboxgl.Map(opts)
      this.map.addControl(new mapboxgl.FullscreenControl())
      this.map.on('load', () => {
        this.createSources()
        this.createLayers()
        this.updateFeatures()
        this.fitFeatures()
        this.map.on('mousemove', this.mapMouseMove)
        this.map.on('click', 'route-active', this.mapClick)
        this.map.resize()
      })
    },
    updateFeatures () {
      const polygons = this.features.filter((s) => { return s.geometry.type === 'MultiPolygon' || s.geometry.type === 'Polygon' })
      const points = this.features.filter((s) => { return s.geometry.type === 'Point' })
      const lines = this.features.filter((s) => { return s.geometry.type === 'LineString' })
      // check if map is initialized... TODO: this could be improved to try again
      const p = this.map.getSource('polygons')
      if (!p) {
        return
      }
      this.map.getSource('polygons').setData({ type: 'FeatureCollection', features: polygons })
      this.map.getSource('lines').setData({ type: 'FeatureCollection', features: lines })
      this.map.getSource('points').setData({ type: 'FeatureCollection', features: points })
    },
    updateFilters () {
      for (const v of mapLayers.routeLayers) {
        const f = (v.filter || []).slice()
        if (!this.showGeneratedShadow) {
          if (f.length === 0) {
            f.push(...['==', 'generated', false])
          } else {
            f.push(['==', 'generated', false])
          }
        }
        if (f.length === 0) {
          this.map.setFilter(v.name, null)
        } else {
          this.map.setFilter(v.name, f)
        }
      }
    },
    createSources () {
      this.map.addSource('polygons', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      })
      this.map.addSource('lines', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      })
      this.map.addSource('points', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      })
      // Add route/stop sources, with geojson features as fallbacks
      if (this.routeTiles) {
        this.map.addSource('routes', {
          type: 'vector',
          tiles: [this.routeTiles.url],
          minzoom: this.routeTiles.minzoom || 0,
          maxzoom: this.routeTiles.maxzoom || 14
        })
      } else {
        this.map.addSource('routes', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: this.routeFeatures }
        })
      }
      if (this.stopTiles) {
        this.map.addSource('stops', {
          type: 'vector',
          tiles: [this.stopTiles.url],
          minzoom: this.stopTiles.minzoom || 0,
          maxzoom: this.stopTiles.maxzoom || 14
        })
      } else {
        this.map.addSource('stops', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: this.stopFeatures }
        })
      }
    },
    createLayers () {
      // Other feature layers
      this.map.addLayer({
        id: 'polygons',
        type: 'fill',
        source: 'polygons',
        layout: {},
        paint: {
          'fill-color': '#ccc',
          'fill-opacity': 0.2
        }
      })
      this.map.addLayer({
        id: 'polygons-outline',
        type: 'line',
        source: 'polygons',
        layout: {},
        paint: {
          'line-width': 2,
          'line-color': '#000',
          'line-opacity': 0.2
        }
      })
      this.map.addLayer({
        id: 'points',
        type: 'circle',
        source: 'points',
        paint: {
          'circle-color': this.circleColor,
          'circle-radius': this.circleRadius,
          'circle-opacity': 0.4
        }
      })
      this.map.addLayer({
        id: 'lines',
        type: 'line',
        source: 'lines',
        layout: {},
        paint: {
          'line-width': 2,
          'line-color': '#000',
          'line-opacity': 1.0
        }
      })
      // Route/Stop layers
      for (const v of mapLayers.routeLayers) {
        const layer = {
          id: v.name,
          type: 'line',
          source: 'routes',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: v.paint
        }
        if (this.routeTiles) {
          layer['source-layer'] = this.routeTiles.id
        }
        if (v.filter) {
          layer.filter = v.filter.slice()
        }
        this.map.addLayer(layer)
      }
      for (const v of mapLayers.stopLayers) {
        const layer = {
          id: v.name,
          type: 'circle',
          source: 'stops',
          paint: v.paint
        }
        if (this.stopTiles) {
          layer['source-layer'] = this.stopTiles.id
        }
        if (v.filter) {
          layer.filter = v.filter.slice()
        }
        this.map.addLayer(layer)
      }
      // Set initial show generated geometry
      this.updateFilters()
    },
    fitFeatures () {
      const coords = []
      for (const f of this.features) {
        const g = f.geometry
        if (g.type === 'Point') {
          coords.push(g.coordinates)
        } else if (g.type === 'LineString') {
          for (const c of g.coordinates) {
            coords.push(c)
          }
        } else if (g.type === 'Polygon') {
          for (const a of g.coordinates) {
            for (const b of a) {
              coords.push(b)
            }
          }
        }
      }
      for (const f of this.stopFeatures) {
        coords.push(f.geometry.coordinates)
      }
      for (const f of this.routeFeatures) {
        for (const c of f.geometry.coordinates) {
          coords.push(c)
        }
      }
      if (this.autoFit && coords.length > 0) {
        const bounds = coords.reduce(function (bounds, coord) {
          return bounds.extend(coord)
        }, new mapboxgl.LngLatBounds(coords[0], coords[0]))
        this.map.fitBounds(bounds, {
          duration: 0,
          padding: 20
        })
      }
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
          { source: 'routes', id: k, sourceLayer: this.routeTiles ? this.routeTiles.id : null },
          { hover: false }
        )
      }
      this.hovering = []
      for (const v of features) {
        this.hovering.push(v.id)
        map.setFeatureState({ source: 'routes', id: v.id, sourceLayer: this.routeTiles ? this.routeTiles.id : null }, { hover: true })
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
    }
  }
}
</script>

<style scoped>
.short {
  height: 600px;
}

.tall {
  height: calc(100vh - 60px);
}

.map-agencies {
  user-select:none;
  position:absolute;
  margin:0px;
  padding:10px;
  top:10px;
  left:10px;
  background:#ffffff;
  width:400px;
  overflow-x:hidden;
  opacity:0.5;
}

.map-options {
  border-bottom:solid 1px #ccc;
  margin-bottom:20px;
}

</style>
