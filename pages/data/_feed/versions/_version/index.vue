<template>
  <div>
    <h1 class="title">
      <nuxt-link :to="{name:'data'}">
        Data
      </nuxt-link> /
      <nuxt-link :to="{name:'data-feed', params:{feed:feedId}}">
        {{ feedId }}
      </nuxt-link>  /
      {{ $route.params.version.substr(0,6) }}…
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

    <route-viewer :fvid="feed_version.sha1" :feed-id="feedId" />
  </div>
</template>

<script>
import RouteViewer from '~/components/route-viewer'

export default {
  components: { RouteViewer },
  asyncData (context) {
    const client = context.app.apolloProvider.defaultClient
    return client.query({
      query: require('~/graphql/feed-version.gql'),
      variables: {
        feed_version_sha1: context.route.params.version
      }
    }).then(({ data }) => {
      return data
    })
  },
  data () {
    return {
      showImportDetails: false
    }
  },
  computed: {
    feed_version () {
      return this.feed_versions[0]
    },
    feedId () {
      return this.$route.params.feed
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
