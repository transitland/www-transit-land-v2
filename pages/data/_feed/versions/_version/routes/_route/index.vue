<template>
  <div>
    <h1 class="title">
      <nuxt-link to="{name:'data'}">
        Data
      </nuxt-link> /
      <nuxt-link :to="{name: 'data-feed', params:{feed:$route.params.feed}}">
        {{ $route.params.feed }}
      </nuxt-link> /
      <nuxt-link :to="{name: 'data-feed-versions-version', params:{feed:$route.params.feed, version:$route.params.version}}">
        {{ $route.params.version.substr(0,6) }}…
      </nuxt-link> /
      {{ $route.params.route }}
    </h1>
    <div class="columns">
      <div class="column is-two-thirds">
        <h1 class="title">
          <route-icon :route-link="route.route_url" :route-type="route.route_type" :route-short-name="route.route_short_name" :route-long-name="route.route_long_name" />
        </h1>

        <h2 class="subtitle clearfix">
          {{ route.agency.agency_name }}
        </h2>

        <nuxt-child v-if="route.id" :route="route" />

        <div>{{ route.route_desc }}</div>
      </div>

      <div class="column is-one-third" style="width:400px">
        <div id="mapelem" ref="mapelem" />

        <div style="margin-left:40px;margin-top:20px;">
          <b-datepicker
            v-model="selectDate"
            :events="serviceDates"
            :nearby-month-days="false"
            :focusable="false"
            size="is-small"
            indicators="bars"
            inline
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js')

function dateSplit (value) {
  const a = value.split('-').map((i) => { return parseInt(i) })
  return [a[0], a[1] - 1, a[2]]
}

export default {
  asyncData (context) {
    const client = context.app.apolloProvider.defaultClient
    return client.query({
      query: require('~/graphql/feed-version-route.gql'),
      variables: {
        feed_version_sha1: context.route.params.version,
        route_id: context.route.params.route
      }
    })
      .then(({ data }) => {
        return data
      })
  },
  data () {
    return {
      map: null,
      selectDate: null
    }
  },
  computed: {
    route () {
      return this.gtfs_routes[0]
    },
    serviceDates () {
      const serviceDates = new Set()
      for (const tc of this.route.trip_calendars) {
        const cal = tc.calendar
        const calDates = new Set()
        let start = new Date(...dateSplit(cal.start_date))
        const end = new Date(...dateSplit(cal.end_date))
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
            calDates.add(start.toISOString().substr(0, 10))
          }
          const newDate = start.setDate(start.getDate() + 1)
          start = new Date(newDate)
        }
        for (const cd of tc.calendar.calendar_dates) {
          if (cd.exception_type === 1) {
            calDates.add(cd.date)
          } else if (cd.exception_type === 2) {
            calDates.delete(cd.date)
          }
        }
        for (const d of calDates) {
          serviceDates.add(d)
        }
      }
      return Array.from(serviceDates).map((d) => { return new Date(...dateSplit(d)) })
    }
  },
  watch: {
    selectDate () {
      this.$router.push({
        name: 'data-feed-version-routes-route-trips-date',
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
    this.initMap()
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
        }
      })
      this.map.on('load', this.drawMap)
    },
    drawMap () {
      const stops = []
      for (const stop of this.route.route_stops) {
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
      for (const shape of this.route.trip_shapes) {
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
    }
  }
}
</script>

<style scoped>
#mapelem {
  width: 100%;
  height: 320px;
}
</style>
