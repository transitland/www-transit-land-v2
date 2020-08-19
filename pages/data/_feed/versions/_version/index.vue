<template>
  <div>
    <b-message v-if="error" class="is-danger">
      {{ error }}
    </b-message>
    <span v-else-if="$apollo.loading" class="is-loading" />
    <div v-else-if="entity">
      <nav class="breadcrumb">
        <ul>
          <li>
            <nuxt-link :to="{name:'data'}">
              Data
            </nuxt-link>
          </li>
          <li>
            <nuxt-link :to="{name: 'data-feed', params:{feed:$route.params.feed}}">
              {{ $route.params.feed | shortenName }}
            </nuxt-link>
          </li>
          <li>
            <nuxt-link :to="{name: 'data-feed-versions-version', params:{feed:$route.params.feed, version:$route.params.version}}">
              {{ $route.params.version | shortenName(6) }}
            </nuxt-link>
          </li>
        </ul>
      </nav>
      <h1 class="title">
        Feed version details: {{ $route.params.version | shortenName(6) }}
      </h1>
      <nav class="level">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Agencies
            </p>
            <p class="title">
              {{ entity.agencies_aggregate.aggregate.count }}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Routes
            </p>
            <p class="title">
              {{ entity.routes_aggregate.aggregate.count }}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Stops
            </p>
            <p class="title">
              {{ entity.stops_aggregate.aggregate.count }}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Earliest Date
            </p>
            <p class="title">
              {{ entity.earliest_calendar_date }}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Latest Date
            </p>
            <p class="title">
              {{ entity.latest_calendar_date }}
            </p>
          </div>
        </div>
      </nav>

      <table class="property-list">
        <tr>
          <td>SHA1</td>
          <td>{{ entity.sha1 }}</td>
        </tr>
        <tr>
          <td>Fetched</td>
          <td>{{ entity.fetched_at }}</td>
        </tr>
        <tr>
          <td>URL</td>
          <td><a :href="entity.url">{{ entity.url }}</a></td>
        </tr>
        <tr>
          <td>Status</td>
          <td v-if="entity.feed_version_gtfs_import && entity.feed_version_gtfs_import.success">
            Success
          </td>
          <td v-else-if="entity.feed_version_gtfs_import && entity.feed_version_gtfs_import.in_progress">
            Import in progress
          </td>
          <td v-else-if="!entity.feed_version_gtfs_import || !entity.feed_version_gtfs_import.success">
            Failed
            <span v-if="entity.feed_version_gtfs_import">{{ entity.feed_version_gtfs_import.exception_log }}</span>
          </td>
        </tr>
        <tr v-if="entity.feed_version_gtfs_import && entity.feed_version_gtfs_import.success">
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
        <tr v-for="(v,fn) of mergedCount(entity.feed_version_gtfs_import)" :key="fn">
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

      <b-tabs v-model="activeTab" type="is-boxed">
        <b-tab-item label="Map">
          <feed-version-map-viewer :fvids="[entity.id]" :overlay="true" />
        </b-tab-item>

        <b-tab-item label="Agencies">
          <agency-viewer v-if="activeTab === 1" :fvid="entity.sha1" />
        </b-tab-item>

        <b-tab-item label="Routes">
          <route-viewer v-if="activeTab === 2" :fvids="[entity.id]" />
        </b-tab-item>

        <b-tab-item label="Stops">
          <stop-viewer v-if="activeTab === 3" :fvids="[entity.id]" />
        </b-tab-item>
      </b-tabs>
    </div>
  </div>
</template>

<script>
export default {
  apollo: {
    feed_versions: {
      error (e) { this.error = e },
      query: require('~/graphql/feed-version.gql'),
      variables () {
        return {
          feed_version_sha1: this.$route.params.version
        }
      }
    }
  },
  data () {
    return {
      activeTab: 0,
      showImportDetails: false,
      feed_versions: [],
      features: [],
      error: null
    }
  },
  computed: {
    entity () {
      return this.feed_versions.length > 0 ? this.feed_versions[0] : null
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
  },
  head () {
    return {
      title: `${this.$route.params.feed} • feed version • ${this.$route.params.version}`
    }
  }

}
</script>
