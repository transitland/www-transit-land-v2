<template>
  <div class="columns">
    <div class="column is-one-third">
      <div id="mapelem" ref="mapelem" />

      <div style="margin-left:40px;margin-top:20px;">
        <b-datepicker
          :events="serviceDates"
          :nearby-month-days="false"
          :focusable="false"
          v-model="selectDate"
          size="is-small"
          indicators="bars"
          inline
        />
      </div>
    </div>

    <div class="column is-two-thirds">
      <h2 class="subtitle">
        {{ entity.agency.agency_name }}
      </h2>

      <h1 class="title">
        <route-icon :routeType="entity.route_type" :routeShortName="entity.route_short_name" :routeLongName="entity.route_long_name" />
        <a :href="entity.route_url"><b-icon icon="link" /></a>
      </h1>

      <nuxt-child :entity="entity" v-if="entity.id" />

      <div>{{ entity.route_desc }}</div>
    </div>
  </div>
</template>

<script>
import apolloProvider from '~/graphql'
import RouteIcon from '~/components/route_icon'
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js')

export default {
  components: { RouteIcon },
  data () {
    return {
      entity: { agency: { routes: [] }, trip_calendars: [], trip_headsigns: [] },
      map: null,
      selectDate: null
    }
  },
  computed: {
    serviceDates () {
      const serviceDates = new Set()
      for (const tc of this.entity.trip_calendars) {
        const cal = tc.calendar
        const calDates = new Set()
        let start = new Date(cal.start_date)
        const end = new Date(cal.end_date)
        while (start <= end) {
          const dow = start.getDay()
          let add = false
          if (dow === 0 && cal.sunday) {
            add = true
          } else if (dow === 1 && cal.monday) {
            add = true
          } else if (dow === 2 && cal.tuesday) {
            add = true
          } else if (dow === 3 && cal.wednesday) {
            add = true
          } else if (dow === 4 && cal.thursday) {
            add = true
          } else if (dow === 5 && cal.friday) {
            add = true
          } else if (dow === 6 && cal.saturday) {
            add = true
          }
          if (add === true) {
            calDates.add(new Date(start))
          }
          const newDate = start.setDate(start.getDate() + 1)
          start = new Date(newDate)
        }
        for (const cd of tc.calendar.calendar_dates) {
          const d = new Date(cd.date)
          if (cd.exception_type === 1) {
            calDates.add(new Date(d))
          } else if (cd.exception_type === 2) {
            calDates.delete(d)
          }
        }
        for (const d of calDates) {
          serviceDates.add(d)
        }
      }
      return Array.from(serviceDates)
    }
  },
  watch: {
    selectDate () {
      this.$router.push({
        name: 'feeds-feed-version-routes-route-trips-date',
        params: {
          feed: this.$route.params.feed,
          version: this.$route.params.version,
          route: this.$route.params.route,
          date: this.selectDate.toISOString().substr(0, 10)
        }
      })
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    load () {
      this.$apollo
        .query({
          query: require('~/graphql/route_details.gql'),
          variables: {
            feed_onestop_id: this.$route.params.feed,
            route_id: this.$route.params.route
          }
        })
        .then((response) => {
          this.entity = response.data.gtfs_routes[0]
          this.route_id = this.entity.id
          this.initMap()
        })
    },
    drawMap () {
      const stops = []
      for (const stop of this.entity.route_stops) {
        stops.push({
          type: 'Feature',
          geometry: stop.stop.geometry,
          properties: {}
        })
      }
      this.map.addSource('stops', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: stops }
      })

      const shapes = []
      for (const shape of this.entity.trip_shapes) {
        shapes.push({
          type: 'Feature',
          geometry: shape.shape.geometry,
          properties: {}
        })
      }
      this.map.addSource('shapes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: shapes }
      })
      const coordinates = stops.map((s) => { return s.geometry.coordinates })
      const bounds = coordinates.reduce(function (bounds, coord) {
        return bounds.extend(coord)
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))
      this.map.fitBounds(bounds, {
        duration: 0,
        padding: 20
      })
      // ----------
      this.map.addLayer({
        id: 'shapes-outline',
        type: 'line',
        source: 'shapes',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#ffffff',
          'line-width': 4,
          'line-gap-width': 2
        }
      })
      this.map.addLayer({
        id: 'shapes',
        type: 'line',
        source: 'shapes',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#1c96d6',
          'line-width': 4
        }
      })
      this.map.addLayer({
        id: 'stops',
        type: 'circle',
        source: 'stops',
        paint: {
          'circle-radius': 2,
          'circle-color': '#B42222'
        }
      })
    },
    initMap () {
      this.map = new mapboxgl.Map({
        container: this.$refs.mapelem,
        style: {
          'version': 8,
          'sources': {
            'raster-tiles': {
              'type': 'raster',
              'tiles': [
                'https://0.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{scale}.png'
              ],
              'tileSize': 256,
              'attribution':
                        'Transitland | Interline | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>'
            }
          },
          'layers': [
            {
              'id': 'simple-tiles',
              'type': 'raster',
              'source': 'raster-tiles',
              'minzoom': 0,
              'maxzoom': 22
            }
          ]
        }
      })
      this.map.on('load', this.drawMap)
    }
  },
  apolloProvider
}
</script>

<style scoped>
#mapelem {
  width: 100%;
  height: 340px;
}
</style>
