<template>
  <div>
    <span v-if="$apollo.loading" class="is-loading" />
    <div v-else-if="entity">
      <nav class="breadcrumb">
        <ul>
          <li>
            <nuxt-link :to="{name:'feeds'}">
              Source Feeds
            </nuxt-link>
          </li>
          <li>
            <nuxt-link :to="{name: 'feeds-feed', params:{feed:$route.params.feed}}">
              {{ $route.params.feed }}
            </nuxt-link>
          </li>
          <li>
            <nuxt-link :to="{name: 'feeds-feed-versions-version', params:{feed:$route.params.feed, version:$route.params.version}}">
              {{ $route.params.version | shortenName(8) }}
            </nuxt-link>
          </li>
        </ul>
      </nav>
      <h1 class="title">
        Feed {{ $route.params.feed }}: version fetched {{ entity.fetched_at | formatDate }} ({{ entity.fetched_at | fromNow }})
      </h1>
      <nav class="level">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Agencies
            </p>
            <p class="title">
              {{ rowCount['agency.txt'] ? rowCount['agency.txt'].toLocaleString() : '-' }}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Routes
            </p>
            <p class="title">
              {{ rowCount['routes.txt'] ? rowCount['routes.txt'].toLocaleString() : '-' }}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Stops
            </p>
            <p class="title">
              {{ rowCount['stops.txt'] ? rowCount['stops.txt'].toLocaleString() : '-' }}
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
          <td>Fetched</td>
          <td>{{ entity.fetched_at | formatDate }} ({{ entity.fetched_at | fromNow }})</td>
        </tr>
        <tr>
          <td>URL</td>
          <td>{{ entity.url }}</td>
        </tr>
        <tr>
          <td>SHA1</td>
          <td><code>{{ entity.sha1 }}</code></td>
        </tr>
        <tr>
          <td>Status</td>
          <td v-if="!fvi">
            Not imported
          </td>
          <td v-else-if="fvi.success">
            Imported successfully
          </td>
          <td v-else-if="fvi.in_progress">
            Import in progress
          </td>
          <td v-else-if="!fvi.success">
            Failed
            <b-message class="is-danger" has-icon>
              {{ fvi.exception_log }}
            </b-message>
          </td>
        </tr>
      </table>

      <br>

      <service-levels :fvid="entity.id" />

      <b-tabs v-model="activeTab" type="is-boxed" :animated="false" @input="setTab">
        <b-tab-item label="Map">
          <feed-version-map-viewer v-if="activeTab === 0" :fvids="[entity.id]" :overlay="true" :link-version="true" />
        </b-tab-item>

        <b-tab-item label="Files">
          <div class="content">
            <table class="table is-striped">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Rows</th>
                  <th>Size</th>
                  <th>SHA1</th>
                  <th>CSV</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="f of entity.files" :key="f.name">
                  <td>{{ f.name }}</td>
                  <td>{{ f.rows }}</td>
                  <td>{{ f.size | prettyBytes }}</td>
                  <td>{{ f.sha1 | shortenName(8) }}</td>
                  <td>
                    <b-tooltip v-if="f.csv_like" dashed>
                      <template v-slot:content>
                        <div>Columns</div>
                        <ul>
                          <li v-for="i of f.header.split(',')" :key="i">
                            {{ i }}
                          </li>
                        </ul>
                      </template>
                      Yes
                    </b-tooltip>
                    <span v-else>No</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </b-tab-item>

        <b-tab-item label="Import log">
          <div class="content">
            <table class="table is-striped">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Rows</th>
                  <th>Imported</th>
                  <th> / </th>
                  <th>Errors</th>
                  <th>Reference errors</th>
                  <th>Filtered</th>
                  <th>Unmarked</th>
                  <th>Warnings</th>
                </tr>
              </thead><tbody>
                <tr v-for="(v,fn) of mergedCount(entity.feed_version_gtfs_import)" :key="fn">
                  <td>{{ fn }}</td>
                  <td>{{ rowCount[fn] }}</td>
                  <td>{{ v.count }}</td>
                  <td />
                  <td>{{ v.skip_error }}</td>
                  <td>{{ v.skip_reference }}</td>
                  <td>{{ v.skip_marked }}</td>
                  <td>{{ v.skip_filter }} </td>
                  <td>{{ v.warnings }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </b-tab-item>

        <b-tab-item label="Agencies">
          <agency-viewer v-if="activeTab === 3" :fvid="entity.sha1" />
        </b-tab-item>

        <b-tab-item label="Routes">
          <route-viewer v-if="activeTab === 4" :link-version="true" :fvids="[entity.id]" />
        </b-tab-item>

        <b-tab-item label="Stops">
          <stop-viewer v-if="activeTab === 5" :fvids="[entity.id]" />
        </b-tab-item>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import EntityPageMixin from '~/components/entity-page-mixin'

export default {
  mixins: [EntityPageMixin],
  apollo: {
    query: {
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
      features: [],
      tabIndex: {
        0: 'map',
        1: 'files',
        2: 'import',
        3: 'agencies',
        4: 'routes',
        5: 'stops'
      }
    }
  },
  computed: {
    fvi () {
      return this.entity.feed_version_gtfs_import
    },
    rowCount () {
      const ret = {}
      for (const f of this.entity.files) {
        ret[f.name] = f.rows
      }
      return ret
    }
  },
  methods: {
    mergedCount (fvi) {
      const m = {}
      if (!fvi) { return m }
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
    const meta = []
    if (this.entity) {
      meta.push({
        hid: 'description',
        name: 'description',
        content: `Feed version from the feed with a Onestop ID of ${this.$route.params.feed} fetched at ${this.entity.fetched_at} by Transitland. This feed version contains ${this.rowCount['agency.txt'] ? this.rowCount['agency.txt'].toLocaleString() : '-'} agencies, ${this.rowCount['routes.txt'] ? this.rowCount['routes.txt'].toLocaleString() : '-'} routes, and ${this.rowCount['stops.txt'] ? this.rowCount['stops.txt'].toLocaleString() : '-'} stops. The SHA1 hash for this feed version is ${this.$route.params.version}`
      })
    }
    return {
      title: `${this.$route.params.feed} • ${this.$route.params.version} • Feed version`,
      meta
    }
  }

}
</script>
