<template>
  <div>
    <h1 class="title">
      Transitland Feeds
    </h1>

    <div class="content is-medium">
      <p>These feeds are the raw data sources aggregated and processed by Transitland. This list is regularly synced from GitHub, where it lives as a series of <abbr title="Distributed Mobility Feed Registry">DMFR</abbr> files in the <a href="https://github.com/transitland/transitland-atlas">Transitland Atlas repository</a>. Edits and additions to the repo are welcome.</p>
      <p>GTFS feeds are checked at least once per day, and a feed version record is created each time a new or updated file is found. If the request fails or produces invalid data, the error is noted and an exception icon appears in the fetched column. Newly discovered feed versions are immediately imported into the Transitland Datastore.</p>
      <p>GTFS-RT feeds are cataloged with URLs for clients to query using your own tools.</p>
      <p>Transitland provides additional metadata and grouped related feeds using <a href="/operators">operators</a>.</p>
    </div>

    <div class="form">
      <div class="field">
        <label class="label">Filter Feeds by Data Specification (Spec)</label>
        <div class="control">
          <b-checkbox v-model="feedSpecs" native-value="gtfs">
            GTFS
          </b-checkbox>
          <b-checkbox v-model="feedSpecs" native-value="gtfs-rt">
            GTFS-RT
          </b-checkbox>
          <!-- <b-checkbox v-model="feedSpecs" native-value="gbfs" disabled="">
            GBFS
          </b-checkbox>
          <b-checkbox v-model="feedSpecs" native-value="mds" disabled="">
            MDS
          </b-checkbox> -->
        </div>
      </div>
    </div>

    <b-table
      :data="feeds"
      :striped="true"
      :paginated="true"
      :pagination-simple="true"
      pagination-position="both"
      :loading="$apollo.loading"
      sort-icon="menu-up"
    >
      <template slot-scope="props">
        <b-table-column :sortable="true" field="onestop_id" label="Feed Onestop ID">
          <nuxt-link :to="{name: 'feeds-feed', params: {feed: props.row.onestop_id}}">
            {{ props.row.onestop_id }}
          </nuxt-link>
        </b-table-column>

        <b-table-column :sortable="true" :width="100" field="spec" label="Spec">
          {{ props.row.spec }}
        </b-table-column>

        <b-table-column :sortable="true" :width="60" numeric field="feed_version_count" label="Versions">
          {{ props.row.feed_version_count }}
        </b-table-column>

        <b-table-column :sortable="true" :width="150" field="last_successful_fetch_at" label="Last Fetched">
          <span v-if="props.row.last_successful_fetch_at">
            {{ props.row.last_successful_fetch_at | moment("from","now") }}
          </span>
          <span v-else>Never</span>
        </b-table-column>

        <b-table-column :sortable="true" :width="60" field="last_fetch_error" label="Fetch Errors?">
          <b-tooltip :label="props.row.last_fetch_error">
            <b-icon v-if="props.row.last_fetch_error" icon="alert" />
          </b-tooltip>
        </b-table-column>

        <b-table-column :sortable="true" :width="150" field="last_successful_import_at" label="Last Imported">
          <span v-if="props.row.last_successful_import_at">
            {{ props.row.last_successful_import_at | moment("from","now") }}
          </span>
          <span v-else>Never</span>
        </b-table-column>

        <b-table-column :sortable="true" :width="60" field="last_import_fail" label="Import Errors?">
          <b-tooltip :label="props.row.last_import_fail">
            <b-icon v-if="props.row.last_import_fail" icon="alert" />
          </b-tooltip>
        </b-table-column>
      </template>
    </b-table>

    <div style="margin-top:40px">
      <b-message type="is-info">
        <div>
          Know a feed that's missing? <a href="https://github.com/transitland/transitland-atlas#readme" class="button" style="float:right">Add a feed to Transitland Atlas</a>
        </div>
      </b-message>
    </div>
  </div>
</template>

<script>
export default {
  apollo: {
    current_feeds: {
      query: require('~/graphql/current_feeds.gql'),
      variables () {
        return {
          specs: this.feedSpecs
        }
      }
    }
  },
  data () {
    return {
      feedSpecs: ['gtfs', 'gtfs-rt'],
      current_feeds: []
    }
  },
  computed: {
    feeds () {
      return this.current_feeds.map((feed) => {
        const feedState = feed.feed_state || {}
        const currentFeedVersion = feedState.feed_version || {}
        const currentImport = (currentFeedVersion && currentFeedVersion.feed_version_gtfs_import) || {}
        const lastFailedFeedVersion = ((feed.import_errors || [{}])[0]) || {}
        let lastImportFail = null
        if (lastFailedFeedVersion.id > (currentFeedVersion.id || 0)) {
          lastImportFail = lastFailedFeedVersion.feed_version_gtfs_import.exception_log
        }
        return {
          onestop_id: feed.onestop_id,
          spec: (feed.spec || '').toUpperCase(),
          last_fetched_at: feedState.last_fetched_at,
          last_fetch_error: feedState.last_fetch_error,
          last_successful_fetch_at: feedState.last_successful_fetch_at,
          last_successful_import_at: currentImport.created_at,
          last_import_fail: lastImportFail,
          feed_version_count: feed.feed_versions_aggregate.aggregate.count
        }
      })
    }
  },
  head () {
    return {
      title: 'Browse all GTFS and GTFS-RT Feeds'
    }
  }
}
</script>
