<template>
  <div class="container">
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
      <p class="content">
        {{ textDescription }}
      </p>
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
              {{ entity.earliest_calendar_date.substr(0,10) }}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Latest Date
            </p>
            <p class="title">
              {{ entity.latest_calendar_date.substr(0,10) }}
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

      <!-- TODO: check license info to make sure redistribution is allowed -->
      <div style="margin-top:40px">
        <b-message type="is-info" has-icon icon="information" :closable="false">
          <div class="columns">
            <div class="column is-8">
              <p>
                Want to download a copy of this feed version to process with your own software?
              </p>
            </div>
            <div class="column is-4 has-text-right">
              <a :href="`https://demo.transit.land/api/v2/rest/feed_versions/${entity.sha1}/download`" target="_blank" class="button is-primary has-addons">
                <b-icon icon="download" title="Download" /> <span>Download</span>
              </a>
            </div>
          </div>
        </b-message>
      </div>

      <b-tabs v-model="activeTab" type="is-boxed" :animated="false" @input="setTab">
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

        <b-tab-item label="Service levels">
          <template v-if="activeTab === 1">
            <client-only placeholder="Service levels">
              <multi-service-levels :fvids="[entity.id]" :week-agg="false" />
            </client-only>
          </template>
        </b-tab-item>

        <b-tab-item label="Map">
          <template v-if="activeTab === 2">
            <div v-if="imported">
              <client-only placeholder="Map">
                <feed-version-map-viewer :feed-version-sha1="entity.sha1" :overlay="true" :link-version="true" />
              </client-only>
            </div>
            <b-message v-else has-icon type="is-warning">
              Map is only available for successfully imported feed versions.
            </b-message>
          </template>
        </b-tab-item>

        <b-tab-item v-if="imported" label="Agencies">
          <agency-viewer v-if="activeTab === 3" :fvid="entity.sha1" />
        </b-tab-item>

        <b-tab-item v-if="imported" label="Routes">
          <route-viewer v-if="activeTab === 4" :link-version="true" :feed-version-sha1="entity.sha1" />
        </b-tab-item>

        <b-tab-item v-if="imported" label="Stops">
          <stop-viewer v-if="activeTab === 5" :link-version="true" :feed-version-sha1="entity.sha1" />
        </b-tab-item>

        <b-tab-item v-if="imported" label="Import log">
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
      </b-tabs>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import EntityPageMixin from '~/components/entity-page-mixin'
import multiServiceLevels from '~/components/multi-service-levels.vue'

const q = gql`
query ($feed_version_sha1: String!) {
  entities: feed_versions(limit: 1, where: {sha1: $feed_version_sha1}) {
    id
    sha1
    earliest_calendar_date
    latest_calendar_date
    url
    fetched_at
    files {
      name
      rows
      size
      sha1
      csv_like
      header
    }
    feed_version_gtfs_import {
      id
      exception_log
      in_progress
      success
      # generated_count
      # interpolated_stop_time_count
      skip_entity_error_count
      skip_entity_reference_count
      skip_entity_filter_count
      skip_entity_marked_count
      warning_count
      entity_count
    }
    agencies {
      agency_name
    }
    feed {
      associated_operators {
        operator_name
        operator_onestop_id
      }
    }
  }
}
`

export default {
  components: { multiServiceLevels },
  mixins: [EntityPageMixin],
  apollo: {
    entities: {
      query: q,
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
        0: 'files',
        1: 'service',
        2: 'map',
        3: 'agencies',
        4: 'routes',
        5: 'stops',
        6: 'import'
      }
    }
  },
  computed: {
    imported () {
      return this.fvi && this.fvi.success
    },
    fvi () {
      return (this.entity && this.entity.feed_version_gtfs_import) ? this.entity.feed_version_gtfs_import : null
    },
    rowCount () {
      const ret = {}
      for (const f of this.entity.files || []) {
        ret[f.name] = f.rows
      }
      return ret
    },
    operatororAgencyNames () {
      if (this.entity && this.entity.feed && this.entity.feed.associated_operators[0].operator_name) {
        return this.entity.feed.associated_operators[0].operator_name
      } else if (this.entity && this.entity.agencies) {
        return this.entity.agencies.map(a => a.agency_name).join(', ')
      } else {
        return null
      }
    },
    textDescription () {
      return `An archived GTFS feed version for ${this.operatororAgencyNames} from the feed with a Onestop ID of ${this.$route.params.feed} first fetched at ${this.entity.fetched_at} by Transitland. This feed version contains ${this.rowCount['agency.txt'] ? this.rowCount['agency.txt'].toLocaleString() : '-'} agencies, ${this.rowCount['routes.txt'] ? this.rowCount['routes.txt'].toLocaleString() : '-'} routes, and ${this.rowCount['stops.txt'] ? this.rowCount['stops.txt'].toLocaleString() : '-'} stops. The SHA1 hash of the contents is ${this.$route.params.version}`
    }
  },
  methods: {
    mergedCount (fvi) {
      const m = {}
      if (!fvi) { return m }
      for (const [a, b] of Object.entries(fvi.entity_count || {})) {
        m[a] = m[a] ? m[a] : {}
        m[a].count = b
      }
      for (const [a, b] of Object.entries(fvi.skip_entity_error_count || {})) {
        m[a] = m[a] ? m[a] : {}
        m[a].skip_error = b
      }
      for (const [a, b] of Object.entries(fvi.skip_entity_reference_count || {})) {
        m[a] = m[a] ? m[a] : {}
        m[a].skip_reference = b
      }
      for (const [a, b] of Object.entries(fvi.skip_entity_marked_count || {})) {
        m[a] = m[a] ? m[a] : {}
        m[a].skip_marked = b
      }
      for (const [a, b] of Object.entries(fvi.skip_entity_filter_count || {})) {
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
        content: this.textDescription
      })
    }
    return {
      title: `${this.$route.params.feed} • ${this.$route.params.version} • Feed version`,
      meta
    }
  }

}
</script>
