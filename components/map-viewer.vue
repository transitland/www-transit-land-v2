<template>
  <div>
    <div id="mapelem" ref="mapelem" />
  </div>
</template>

<script>
import mapLayers from '~/plugins/map-layers.js'
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js')

export default {
  props: {
    features: {
      type: Array, default () { return [] }
    }
  },
  data () {
    return {
      map: null,
      hovering: []
    }
  },
  mounted () {
    if (this.features) {
      this.initMap()
    }
  },
  wach: {
    features (v) {
      if (v) {
        this.$nextTick(() => {
          this.initMap()
        })
      }
    }
  },
  methods: {
    initMap () {
      this.map = new mapboxgl.Map({
        container: this.$refs.mapelem,
        style: {
          version: 8,
          sources: {
            'raster-tiles': {
              type: 'raster',
              tiles: ['https://0.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{scale}.png'],
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
      this.map.on('mousemove', this.mapMouseMove)
      this.map.on('click', 'route-active', this.mapClick)
      this.map.on('load', this.drawMap)
    },
    drawMap () {
      const points = this.features.filter((s) => { return s.geometry.type === 'Point' })
      const lines = this.features.filter((s) => { return s.geometry.type === 'LineString' })

      this.map.addSource('routes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: lines }
      })
      // this.map.addLayer({
      //   id: 'lines',
      //   type: 'line',
      //   source: 'lines',
      //   layout: {
      //     'line-join': 'round',
      //     'line-cap': 'round'
      //   },
      //   paint: {
      //     'line-color': '#1c96d6',
      //     'line-width': 2
      //   }
      // })
      for (const v of mapLayers.routelayers) {
        const l = {
          id: v.name,
          type: 'line',
          source: 'routes',
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

      this.map.resize()
      const bounds = coordinates.reduce(function (bounds, coord) {
        return bounds.extend(coord)
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))
      this.map.fitBounds(bounds, {
        duration: 0,
        padding: 20
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
</style>
