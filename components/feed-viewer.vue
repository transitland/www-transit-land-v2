<template>
  <div>
    <b-message v-if="error" class="is-danger">
      {{ error }}
    </b-message>

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
          <b-checkbox v-model="feedSpecs" native-value="gbfs">
            GBFS
          </b-checkbox>
          <!-- <b-checkbox v-model="feedSpecs" native-value="mds" disabled="">
            MDS
          </b-checkbox> -->
        </div>
      </div>
    </div>

    <b-table
      :loading="$apollo.loading"
      :data="feedPage"
      :striped="true"
      :paginated="true"
      sort-icon="menu-up"
      :total="total"
      backend-pagination
      backend-sorting
      backend-filtering
      @page-change="onPageChange"
      @sort="onSort"
    >
      <b-table-column v-slot="props" field="onestop_id" label="Feed Onestop ID">
        <nuxt-link :to="{name: 'feeds-feed', params: {feed: props.row.onestop_id}}">
          {{ props.row.onestop_id }}
        </nuxt-link>
      </b-table-column>

      <b-table-column v-slot="props" :width="100" field="spec" label="Spec">
        {{ props.row.spec }}
      </b-table-column>

      <b-table-column v-slot="props" :width="60" numeric field="feed_version_count" label="Versions">
        {{ props.row.feed_version_count }}
      </b-table-column>

      <b-table-column v-slot="props" :width="150" field="last_successful_fetch_at" label="Last Fetched">
        <span v-if="props.row.last_successful_fetch_at">
          {{ props.row.last_successful_fetch_at | fromNow }}
        </span>
        <span v-else>Never</span>
      </b-table-column>

      <b-table-column v-slot="props" :width="60" field="last_fetch_error" label="Fetch Errors?">
        <b-tooltip :label="props.row.last_fetch_error">
          <b-icon v-if="props.row.last_fetch_error" icon="alert" />
        </b-tooltip>
      </b-table-column>

      <b-table-column v-slot="props" :width="150" field="last_successful_import_at" label="Last Imported">
        <span v-if="props.row.last_successful_import_at">
          {{ props.row.last_successful_import_at | fromNow }}
        </span>
        <span v-else>Never</span>
      </b-table-column>

      <b-table-column v-slot="props" :width="60" field="last_import_fail" label="Import Errors?">
        <b-tooltip :label="props.row.last_import_fail">
          <b-icon v-if="props.row.last_import_fail" icon="alert" />
        </b-tooltip>
      </b-table-column>
    </b-table>
  </div>
</template>

<script>
import TableViewerMixin from '~/components/table-viewer-mixin'

export default {
  mixins: [TableViewerMixin],
  apollo: {
    q: {
      query: require('~/graphql/current-feeds.gql'),
      variables () {
        return {
          offset: this.entityOffset,
          limit: this.limit,
          specs: this.feedSpecs
        }
      },
      update (data) {
        this.entities = data.entities
        this.total = data.count.aggregate.count
      },
      error (e) { this.error = e }
    }
  },
  data () {
    return {
      feedSpecs: ['gtfs', 'gtfs-rt', 'gbfs']
    }
  },
  computed: {
    feedPage () {
      return this.entityPage.map((feed) => {
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
  methods: {
    clearQuery () {
      this.$router.push({ path: 'feeds', query: { } })
    },
    onAutocomplete (a, b) {
      const q = { page: 1 }
      q[a] = b
      this.$router.push({ path: 'feeds', query: q })
    }
  }
}
</script>
