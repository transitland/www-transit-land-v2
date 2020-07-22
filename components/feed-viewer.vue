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
      :loading="$apollo.loading"
      pagination-position="both"
      sort-icon="menu-up"
      :total="total"
      :current-page="currentPage"
      backend-pagination
      backend-sorting
      @sort="onSort"
      @page-change="onPageChange"
    >
      <template slot-scope="props">
        <b-table-column field="onestop_id" label="Feed Onestop ID">
          <nuxt-link :to="{name: 'data-feed', params: {feed: props.row.onestop_id}}">
            {{ props.row.onestop_id }}
          </nuxt-link>
        </b-table-column>

        <b-table-column :width="100" field="spec" label="Spec">
          {{ props.row.spec }}
        </b-table-column>

        <b-table-column :width="60" numeric field="feed_version_count" label="Versions">
          {{ props.row.feed_version_count }}
        </b-table-column>

        <b-table-column :width="150" field="last_successful_fetch_at" label="Last Fetched">
          <span v-if="props.row.last_successful_fetch_at">
            {{ props.row.last_successful_fetch_at | moment("from","now") }}
          </span>
          <span v-else>Never</span>
        </b-table-column>

        <b-table-column :width="60" field="last_fetch_error" label="Fetch Errors?">
          <b-tooltip :label="props.row.last_fetch_error">
            <b-icon v-if="props.row.last_fetch_error" icon="alert" />
          </b-tooltip>
        </b-table-column>

        <b-table-column :width="150" field="last_successful_import_at" label="Last Imported">
          <span v-if="props.row.last_successful_import_at">
            {{ props.row.last_successful_import_at | moment("from","now") }}
          </span>
          <span v-else>Never</span>
        </b-table-column>

        <b-table-column :width="60" field="last_import_fail" label="Import Errors?">
          <b-tooltip :label="props.row.last_import_fail">
            <b-icon v-if="props.row.last_import_fail" icon="alert" />
          </b-tooltip>
        </b-table-column>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  apollo: {
    q: {
      query: require('~/graphql/current-feeds.gql'),
      variables () {
        return {
          specs: this.feedSpecs,
          offset: this.blockOffset,
          limit: 100
        }
      },
      update (data) {
        const b = new Map()
        for (let i = 0; i < data.entities.length; i++) {
          b.set(i + this.blockOffset, data.entities[i])
        }
        this.blockEntities = b
        this.total = data.count.aggregate.count
      },
      error (e) { this.error = e }
    }
  },
  data () {
    return {
      feedSpecs: ['gtfs', 'gtfs-rt'],
      blockEntities: new Map(),
      blockSize: 100,
      total: 0,
      error: null
    }
  },
  computed: {
    blockOffset () {
      const blockOffset = Math.floor(((this.currentPage - 1) * 20) / this.blockSize) * this.blockSize
      return blockOffset
    },
    currentPage () {
      return this.$route.query.page ? parseInt(this.$route.query.page) : 1
    },
    currentPageEntities () {
      const a = (this.currentPage - 1) * 20
      const b = []
      for (let i = a; i < a + 20; i++) {
        const row = this.blockEntities.get(i)
        if (!row) {
          return b
        }
        b.push(row)
      }
      return b
    },
    feeds () {
      return this.currentPageEntities.map((feed) => {
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
      this.$router.push({ path: 'data', query: { } })
    },
    onAutocomplete (a, b) {
      const q = { page: 1 }
      q[a] = b
      this.$router.push({ path: 'data', query: q })
    },
    onPageChange (page) {
      const q = Object.assign({}, this.$route.query)
      q.page = page
      this.$router.push({ path: 'data', query: q })
    },
    onSort (field, order) {
    }
  }
}
</script>
