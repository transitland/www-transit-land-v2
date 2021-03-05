<template>
  <div class="container">
    <h1 class="title">
      Transitland Source Feeds
    </h1>

    <div class="content">
      <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
      <p>Transitland aggregates data from thousands of public GTFS, GTFS Realtime, GBFS, and MSD feeds. Use the following table to search through Transitland's feed records. Or switch to browsing <nuxt-link :to="{name:'operators'}">Transitland operators</nuxt-link>, which group together related feeds for a richer experience.</p>
      <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
      <p>Transitland's registry of feeds for viewing and editing in the <nuxt-link to="/documentation/atlas">Transitland Atlas</nuxt-link> repository on GitHub. <a href="/documentation/atlas#how-to-contribute-or-edit-a-feed">We welcome contributions!</a></p>
    </div>

    <div>
      <b-message v-if="error" class="is-danger">
        {{ error }}
      </b-message>

      <b-field grouped group-multiline>
        <b-field label="Search by feed name">
          <div style="width:300px">
            <search-bar v-model="search" />
          </div>
        </b-field>

        <b-field label="Filter by fetch status">
          <b-select v-model="fetchError">
            <option value="">
              All
            </option>
            <option value="false">
              No fetch error
            </option>
            <option value="true">
              Has fetch error
            </option>
          </b-select>
        </b-field>

        <b-field label="Filter by import status">
          <b-select v-model="importStatus">
            <option value="">
              All
            </option>
            <option value="success">
              Success
            </option>
            <option value="error">
              Error
            </option>
            <option value="in_progress">
              In progress
            </option>
          </b-select>
        </b-field>

        <b-field label="Filter by data format" class="pl-3">
          <div class="pt-2">
            <b-checkbox v-model="feedSpecs" native-value="gtfs" class="is-medium">
              <abbr title="General Transit Feed Specification">GTFS</abbr>
            </b-checkbox>
            <b-checkbox v-model="feedSpecs" native-value="gtfs-rt" class="is-medium">
              <abbr title="GTFS Realtime">GTFS-RT</abbr>
            </b-checkbox>
            <b-checkbox v-model="feedSpecs" native-value="gbfs" class="is-medium">
              <abbr title="General Bikeshare Feed Specification">GBFS</abbr>
            </b-checkbox>
            <b-checkbox v-model="feedSpecs" native-value="mds" class="is-medium">
              <abbr title="Mobility Data Specification">MDS</abbr>
            </b-checkbox>
          </div>
        </b-field>
      </b-field>

      <b-table
        :loading="$apollo.loading"
        :data="feedPage"
        :striped="true"
      >
        <b-table-column v-slot="props" field="onestop_id" label="Feed Onestop ID">
          <nuxt-link :to="{name: 'feeds-feed', params: {feed: props.row.onestop_id}}">
            {{ props.row.onestop_id }}
          </nuxt-link>
        </b-table-column>

        <b-table-column v-slot="props" field="spec" label="Format">
          {{ props.row.spec.toUpperCase() }}
        </b-table-column>

        <b-table-column v-slot="props" field="last_successful_fetch_at" label="Last Fetched">
          <span v-if="props.row.spec === 'gtfs'">
            <template v-if="props.row.last_successful_fetch_at">
              {{ props.row.last_successful_fetch_at | fromNow }}
            </template>
            <template v-else>
              Never
            </template>
          </span>
        </b-table-column>

        <b-table-column v-slot="props" field="last_successful_import_at" label="Last Imported">
          <span v-if="props.row.spec === 'gtfs'">
            <template v-if="props.row.last_successful_import_at">
              {{ props.row.last_successful_import_at | fromNow }}
            </template>
            <template v-else>
              Never
            </template>
          </span>
        </b-table-column>

        <b-table-column v-slot="props" field="last_fetch_error" label="Fetch Errors">
          <b-tooltip v-if="props.row.last_fetch_error" :label="props.row.last_fetch_error" multilined>
            <b-icon icon="alert" />
          </b-tooltip>
        </b-table-column>

        <!-- <b-table-column v-slot="props" field="last_import_fail" label="Errors">
          <b-tooltip :label="props.row.last_import_fail">
            <b-icon v-if="props.row.last_import_fail" icon="alert" />
          </b-tooltip>
        </b-table-column> -->
      </b-table>
      <show-more v-if="entities.length === limit || hasMore" :limit="entities.length" @click="showAll" />
    </div>
    <div style="margin-top:40px">
      <b-message type="is-info">
        <div>
          Know a public feed that's missing from Transitland? <a href="/documentation/atlas#how-to-contribute-or-edit-a-feed" class="button" style="float:right">Add a feed to Transitland Atlas</a>
        </div>
      </b-message>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import TableViewerMixin from '~/components/table-viewer-mixin'

const q = gql`
query($specs: [String!], $after: Int, $limit:Int, $search: String, $fetch_error: Boolean, $import_status: ImportStatus) {
  entities: feeds(after: $after, limit:$limit, where: {search: $search, spec: $specs, fetch_error: $fetch_error, import_status: $import_status}) {
    id
    onestop_id
    spec
    feed_state {
      id
      feed_version {
        id
        fetched_at
        sha1
        feed_version_gtfs_import {
          id
          created_at
        }
      }
      last_fetch_error
      last_fetched_at
      last_successful_fetch_at
    }
  }
}
`

const nullBool = function (v) {
  if (v === 'true') {
    return true
  } else if (v === 'false') {
    return false
  }
  return null
}

const nullString = function (v) {
  if (!v || v.length === 0) {
    return null
  }
  return v
}

export default {
  mixins: [TableViewerMixin],
  apollo: {
    entities: {
      query: q,
      variables () {
        return {
          search: this.search,
          limit: this.limit,
          specs: this.feedSpecs,
          fetch_error: nullBool(this.fetchError),
          import_status: nullString(this.importStatus)
        }
      },
      error (e) { this.error = e }
    }
  },
  data () {
    let spec = this.$route.query.feed_specs
    if (Array.isArray(spec)) {
    } else if (spec) {
      spec = [spec]
    } else {
      spec = ['gtfs', 'gtfs-rt', 'gbfs', 'mds']
    }
    return {
      feedSpecs: spec,
      fetchError: this.$route.query.fetch_error,
      importStatus: this.$route.query.import_status
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
          spec: feed.spec,
          last_fetched_at: feedState.last_fetched_at,
          last_fetch_error: feedState.last_fetch_error,
          last_successful_fetch_at: feedState.last_successful_fetch_at,
          last_successful_import_at: currentImport.created_at,
          last_import_fail: lastImportFail
        }
      })
    }
  },
  watch: {
    fetchError (v) {
      this.$router.replace({ name: 'feeds', query: { ...this.$route.query, fetch_error: v } })
    },
    importStatus (v) {
      this.$router.replace({ name: 'feeds', query: { ...this.$route.query, import_status: v } })
    },
    feedSpecs (v) {
      this.$router.replace({ name: 'feeds', query: { ...this.$route.query, feed_specs: v } })
    }
  },
  head () {
    return {
      title: 'Source Feeds: GTFS, GTFS Realtime, GBFS',
      meta: [
        { hid: 'description', name: 'description', content: 'GTFS, GTFS Realtime, and GBFS source feeds cataloged by the Transitland platform.' }
      ]
    }
  }
}
</script>
