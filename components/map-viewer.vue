<template>
  <div>
    <div id="mapelem" ref="mapelem" />
    <div v-if="overlay" class="is-hidden-mobile">
      <div class="map-agencies notification">
        <p v-show="Object.keys(agencyFeatures).length == 0">
          <strong>Use your mouse cursor</strong> to highlight routes and see their names here. <strong>Click</strong> to select for more details.
        </p>
        <route-select :agency-features="agencyFeatures" :collapse="true" />
      </div>
    </div>

    <b-modal
      v-if="overlay"
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

export default {
  props: {
    interactive: { type: Boolean, default: true },
    overlay: { type: Boolean, default: false },
    autoFit: { type: Boolean, default: true },
    center: { type: Array, default () { return [] } },
    circleRadius: { type: Number, default: 5 },
    circleColor: { type: String, default: '#f03b20' },
    zoom: { type: Number, default: 14 },
    features: {
      type: Array, default () { return [] }
    }
  },
  data () {
    return {
      map: null,
      hovering: [],
      agencyFeatures: {},
      isComponentModalActive: false
    }
  },
  watch: {
    features (v) {
      if (v) {
        this.$nextTick(() => {
          this.redraw()
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
      this.map = new mapboxgl.Map({
        interactive: this.interactive,
        preserveDrawingBuffer: true,
        container: this.$refs.mapelem,
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
      })
      this.map.addControl(new mapboxgl.FullscreenControl())
      this.map.on('load', this.drawMap)
    },
    redraw () {
      const polygons = this.features.filter((s) => { return s.geometry.type === 'MultiPolygon' || s.geometry.type === 'Polygon' })
      const points = this.features.filter((s) => { return s.geometry.type === 'Point' })
      const lines = this.features.filter((s) => { return s.geometry.type === 'LineString' })
      this.map.getSource('polygons').setData({ type: 'FeatureCollection', features: polygons })
      this.map.getSource('lines').setData({ type: 'FeatureCollection', features: lines })
      this.map.getSource('points').setData({ type: 'FeatureCollection', features: points })
    },
    drawMap () {
      const polygons = this.features.filter((s) => { return s.geometry.type === 'MultiPolygon' || s.geometry.type === 'Polygon' })
      const points = this.features.filter((s) => { return s.geometry.type === 'Point' })
      const lines = this.features.filter((s) => { return s.geometry.type === 'LineString' })
      this.map.addSource('polygons', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: polygons }
      })
      this.map.addSource('lines', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: lines }
      })
      this.map.addSource('points', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: points }
      })
      this.map.addLayer({
        id: 'polygons',
        type: 'fill',
        source: 'polygons',
        layout: {},
        paint: {
          'fill-color': '#ccc',
          'fill-opacity': 0.4
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
          'line-opacity': 1.0
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
      for (const v of mapLayers.routeLayers) {
        const l = {
          id: v.name,
          type: 'line',
          source: 'lines',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: v.paint
        }
        if (v.filter != null) {
          l.filter = v.filter
        }
        this.map.addLayer(l)
      }
      const coordinates = points.map((s) => { return s.geometry.coordinates })
      for (const line of lines) {
        for (const c of line.geometry.coordinates) {
          coordinates.push(c)
        }
      }
      for (const polygon of polygons) {
        for (const a of polygon.geometry.coordinates) {
          for (const b of a) {
            coordinates.push(b)
          }
        }
      }
      this.map.resize()
      if (this.autoFit) {
        const bounds = coordinates.reduce(function (bounds, coord) {
          return bounds.extend(coord)
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))
        this.map.fitBounds(bounds, {
          duration: 0,
          padding: 20
        })
      } else {
        this.map.flyTo({
          center: this.center,
          zoom: this.zoom,
          duration: 0
        })
      }
      // Click handler
      this.map.on('mousemove', this.mapMouseMove)
      this.map.on('click', 'route-active', this.mapClick)
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
          { source: 'lines', id: k },
          { hover: false }
        )
      }
      this.hovering = []
      for (const v of features) {
        this.hovering.push(v.id)
        map.setFeatureState({ source: 'lines', id: v.id }, { hover: true })
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
  }
}
</script>

<style scoped>
#mapelem {
  width: 100%;
  height: 600px;
}
.map-agencies {
  position:absolute;
  top:10px;
  left:0px;
  background:#ffffff;
  width:400px;
  overflow-x:hidden;
  opacity:0.5;
}
</style>
