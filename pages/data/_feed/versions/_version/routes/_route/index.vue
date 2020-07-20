<template>
  <div v-if="entity">
    <h1 class="title clearfix">
      <nuxt-link :to="{name:'data'}">
        Data
      </nuxt-link> /
      <nuxt-link :to="{name: 'data-feed', params:{feed:$route.params.feed}}">
        {{ $route.params.feed | shortenName }}
      </nuxt-link> /
      <nuxt-link :to="{name: 'data-feed-versions-version', params:{feed:$route.params.feed, version:$route.params.version}}">
        {{ $route.params.version | shortenName(8) }}
      </nuxt-link> /
      <nuxt-link :to="{name: 'data-feed-versions-version-agencies-agency', params:{feed:$route.params.feed, version:$route.params.version, agency: entity.agency.agency_id }}">
        {{ entity.agency.agency_name }}
      </nuxt-link>
    </h1>
    <h1 class="title">
      <nuxt-link
        :to="{name: 'data-feed-versions-version-routes-route', params:{feed:$route.params.feed,version:$route.params.version,route:$route.params.route}}"
      >
        <route-icon :route-link="entity.route_url" :route-type="entity.route_type" :route-short-name="entity.route_short_name" :route-long-name="entity.route_long_name" />
      </nuxt-link>
    </h1>
    <div class="columns">
      <div class="column is-two-thirds">
        <b-tabs v-model="activeTab" type="is-boxed" :animated="false">
          <b-tab-item label="Summary">
            <headway-viewer :headways="entity.headways" />
            <div class="clearfix">
              {{ entity.entity_desc }}
            </div>
          </b-tab-item>

          <b-tab-item label="Inbound">
            <route-trips-viewer :service-date="serviceDate" :route-id="entity.id" :feed-version-id="entity.feed_version_id" :direction-id="0" />
          </b-tab-item>

          <b-tab-item label="Outbound">
            <route-trips-viewer :service-date="serviceDate" :route-id="entity.id" :feed-version-id="entity.feed_version_id" :direction-id="1" />
          </b-tab-item>

          <b-tab-item :label="childLabel">
            <nuxt-child :service-date="serviceDate" :entity="entity" :label.sync="childLabel" />
          </b-tab-item>
        </b-tabs>
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
import moment from 'moment'
import HeadwayViewer from '~/components/headway-viewer'
import RouteTripsViewer from '~/components/route-trips-viewer'
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js')

function dateSplit (value) {
  const a = value.split('-').map((i) => { return parseInt(i) })
  return [a[0], a[1] - 1, a[2]]
}

export default {
  components: { HeadwayViewer, RouteTripsViewer },
  data () {
    return {
      map: null,
      selectDate: null,
      entities: [],
      activeTab: 0,
      childLabel: null
    }
  },
  apollo: {
    entities: {
      query: require('~/graphql/feed-version-route.gql'),
      variables () {
        return {
          feed_version_sha1: this.$route.params.version,
          route_id: this.$route.params.route
        }
      }
    }
  },
  computed: {
    serviceDate () {
      return this.$route.query.service_date ? this.$route.query.service_date : moment().format('YYYY-MM-DD')
    },
    entity () {
      return this.entities.length > 0 ? this.entities[0] : null
    },
    serviceDates () {
      const serviceDates = new Set()
      for (const tc of (this.entity.trip_calendars || [])) {
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
    childLabel () {
      this.activeTab = 3
    },
    selectDate () {
      this.$router.push({
        name: this.$router.name,
        query: {
          service_date: this.selectDate.toISOString().substr(0, 10)
        }
      })
    },
    entity (v) {
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
      for (const shape of this.entity.geometries) {
        shapes.push({
          type: 'Feature',
          geometry: shape.geometry,
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
