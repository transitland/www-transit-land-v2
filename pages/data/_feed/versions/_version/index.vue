<template>
  <div v-if="feed_version">
    <h1 class="title">
      <nuxt-link :to="{name:'data'}">
        Data
      </nuxt-link> /
      <nuxt-link :to="{name:'data-feed', params:{feed:feedId}}">
        {{ feedId | shortenName }}
      </nuxt-link>  /
      {{ $route.params.version }}
    </h1>
    <nav class="level">
      <div class="level-item has-text-centered">
        <div>
          <p class="heading">
            Agencies
          </p>
          <p class="title">
            {{ feed_version.agencies_aggregate.aggregate.count }}
          </p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <p class="heading">
            Routes
          </p>
          <p class="title">
            {{ feed_version.routes_aggregate.aggregate.count }}
          </p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <p class="heading">
            Stops
          </p>
          <p class="title">
            {{ feed_version.stops_aggregate.aggregate.count }}
          </p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <p class="heading">
            Earliest Date
          </p>
          <p class="title">
            {{ feed_version.earliest_calendar_date }}
          </p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <p class="heading">
            Latest Date
          </p>
          <p class="title">
            {{ feed_version.latest_calendar_date }}
          </p>
        </div>
      </div>
    </nav>

    <table class="property-list">
      <tr>
        <td>SHA1</td>
        <td>{{ feed_version.sha1 }}</td>
      </tr>
      <tr>
        <td>Fetched</td>
        <td>{{ feed_version.fetched_at }}</td>
      </tr>
      <tr>
        <td>URL</td>
        <td><a :href="feed_version.url">{{ feed_version.url }}</a></td>
      </tr>
      <tr>
        <td>Status</td>
        <td v-if="feed_version.feed_version_gtfs_import.success">
          Success
        </td>
        <td v-else-if="feed_version.feed_version_gtfs_import.in_progress">
          Import in progress
        </td>
        <td v-else-if="!feed_version.feed_version_gtfs_import.success">
          Failed: {{ feed_version.feed_version_gtfs_import.exception_log }}
        </td>
      </tr>
      <tr v-if="feed_version.feed_version_gtfs_import.success">
        <td />
        <td>
          <button class="button" @click="showImportDetails = !showImportDetails">
            Show detailed import information
          </button>
        </td>
      </tr>
    </table>
    <table v-if="showImportDetails" class="property-list">
      <tr>
        <th />
        <th>Imported</th>
        <th> / </th>
        <th>Errors</th>
        <th>Reference errors</th>
        <th>Filtered</th>
        <th>Unmarked</th>
        <th>Warnings</th>
      </tr>
      <tr v-for="(v,fn) of mergedCount(feed_version.feed_version_gtfs_import)" :key="fn">
        <td>{{ fn }}</td>
        <td>{{ v.count }}</td>
        <td />
        <td>{{ v.skip_error }}</td>
        <td>{{ v.skip_reference }}</td>
        <td>{{ v.skip_marked }}</td>
        <td>{{ v.skip_filter }} </td>
        <td>{{ v.warnings }}</td>
      </tr>
    </table>

    <br>

    <b-tabs type="is-boxed">
      <b-tab-item label="Map">
        <button v-if="mapFeatures.length === 0" class="button is-loading">
          Loading
        </button>
        <map-viewer v-else :features="mapFeatures" />
      </b-tab-item>

      <b-tab-item label="Agencies">
        <agency-viewer :fvid="feed_version.sha1" />
      </b-tab-item>

      <b-tab-item label="Routes">
        <route-viewer :fvid="feed_version.sha1" />
      </b-tab-item>

      <b-tab-item label="Stops">
        <stop-viewer :fvid="feed_version.sha1" />
      </b-tab-item>
    </b-tabs>
  </div>
</template>

<script>
import RouteViewer from '~/components/route-viewer'
import StopViewer from '~/components/stop-viewer'
import AgencyViewer from '~/components/agency-viewer'
import MapViewer from '~/components/map-viewer'

export default {
  components: { RouteViewer, StopViewer, AgencyViewer, MapViewer },
  apollo: {
    feed_versions: {
      query: require('~/graphql/feed-version.gql'),
      variables () {
        return {
          feed_version_sha1: this.$route.params.version
        }
      }
    },
    features: {
      query: require('~/graphql/map-routes.gql'),
      skip () { return !this.feed_version },
      variables () {
        return {
          feed_version_id: this.feed_version.id,
          offset: 0,
          limit: 1000
        }
      }
    }
  },
  data () {
    return {
      showImportDetails: false,
      feed_versions: [],
      features: []
    }
  },
  computed: {
    feed_version () {
      return this.feed_versions.length > 0 ? this.feed_versions[0] : null
    },
    feedId () {
      return this.$route.params.feed
    },
    mapFeatures () {
      const features = []
      for (const feature of this.features) {
        if (feature.geometries && feature.geometries.length > 0) {
          let hw = 10000
          if (feature.headways_weekday && feature.headways_weekday.headway_seconds_morning_mid) {
            hw = feature.headways_weekday.headway_seconds_morning_mid
          }
          let routeColor = feature.route_color
          if (routeColor && routeColor.substr(0, 1) !== '#') {
            routeColor = '#' + routeColor
          }
          features.push({
            id: feature.id,
            properties: {
              id: feature.id,
              route_id: feature.route_id,
              feed_version_sha1: this.feed_version.sha1,
              onestop_id: this.$route.params.feed,
              route_short_name: feature.route_short_name,
              route_long_name: feature.route_long_name,
              route_type: feature.route_type,
              route_color: routeColor,
              agency_name: feature.agency.agency_name,
              headway_secs: hw
            },
            geometry: feature.geometries[0].geometry
          })
        }
      }
      return features
    }
  },
  methods: {
    mergedCount (fvi) {
      const m = {}
      for (const [a, b] of Object.entries(fvi.entity_count)) {
        m[a] = m[a] ? m[a] : {}
        m[a].count = b
      }
      for (const [a, b] of Object.entries(fvi.skip_entity_error_count)) {
        m[a] = m[a] ? m[a] : {}
        m[a].skip_error = b
      }
      for (const [a, b] of Object.entries(fvi.skip_entity_reference_count)) {
        m[a] = m[a] ? m[a] : {}
        m[a].skip_reference = b
      }
      for (const [a, b] of Object.entries(fvi.skip_entity_marked_count)) {
        m[a] = m[a] ? m[a] : {}
        m[a].skip_marked = b
      }
      for (const [a, b] of Object.entries(fvi.skip_entity_filter_count)) {
        m[a] = m[a] ? m[a] : {}
        m[a].skip_filter = b
      }
      return m
    }
  }
}
</script>
