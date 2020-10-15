<template>
  <div>
    <div id="map" ref="map" style="height:600px" />
  </div>
</template>

<script>
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js')

// const defaultStyle = {
//   version: 8,
//   zoom: 12,
//   center: [-87.628611, 41.860025],
//   sources: {
//     'raster-tiles': {
//       type: 'raster',
//       tiles: ['https://0.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{scale}.png'],
//       tileSize: 256,
//       attribution: 'OpenStreetMap | Carto'
//     }
//   },
//   layers: [
//     {
//       id: 'simple-tiles',
//       type: 'raster',
//       source: 'raster-tiles'
//     }
//   ]
// }

export default {
  mounted () {
    const map = new mapboxgl.Map({
      container: 'map',
      transformRequest: (url, resourceType) => {
        if (resourceType === 'Tile' && url.startsWith('https://transit.land')) {
          return {
            url,
            headers: { apikey: 'chaMbwRkYXi7uPzflTN373Up1mOlgCKV' }
          }
        }
      },
      style: {
        version: 8,
        zoom: 12,
        center: [-87.628611, 41.860025],
        sources: {
          routes: {
            type: 'vector',
            tiles: ['https://transit.land/mbtiles/routes/tiles/{z}/{x}/{y}.pbf'],
            maxzoom: 14
          }
        },
        layers: [{
          id: 'routes',
          type: 'line',
          source: 'routes',
          'source-layer': 'routes',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-width': 3.0,
            'line-color': '#ff0000'
          }
        }]
      }
    })
    console.log(map)
    // map.on('load', () => {
    //   map.addSource('routes', {
    //     type: 'vector',
    //     tiles: ['https://transit.land/mbtiles/routes/tiles/{z}/{x}/{y}.pbf'],
    //     maxzoom: 14
    //   })
    //   map.addLayer({
    //     id: 'routes',
    //     type: 'line',
    //     source: 'routes',
    //     'source-layer': 'routes',
    //     layout: {
    //       'line-cap': 'round',
    //       'line-join': 'round'
    //     },
    //     paint: {
    //       'line-width': 3.0,
    //       'line-color': '#ff0000'
    //     }
    //   })
    // })
  }
}
</script>
