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
        <map-viewer :features="mapFeatures" />
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
import gql from 'graphql-tag'
import RouteViewer from '~/components/route-viewer'
import StopViewer from '~/components/stop-viewer'
import AgencyViewer from '~/components/agency-viewer'
import MapViewer from '~/components/map-viewer'

const routeFeatures = gql`
query ($feed_version_id: bigint!, $offset: Int!, $limit: Int!, $agency_id: bigint, $route_id: bigint) {
  features: tl_route_geometries(limit: $limit, where: {feed_version_id: {_eq: $feed_version_id}, route_id: {_eq: $agency_id}}, order_by: {route_id: desc}, offset: $offset) {
    route_id
    geometry
  }
}
`

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
      query: routeFeatures,
      skip () { return !this.feed_version },
      variables () {
        return {
          feed_version_id: this.feed_version.id,
          offset: 0,
          limit: 10000
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
        features.push({
          properties: { id: feature.id },
          geometry: feature.geometry
        })
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
