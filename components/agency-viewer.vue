<template>
  <div>
    <b-message v-if="error" class="is-danger">
      {{ error }}
    </b-message>
    <div v-else>
      <search-bar v-model="search" placeholder="Filter Agencies" />
      <b-table
        :loading="$apollo.loading"
        :data="entityPage"
        :striped="true"
        sort-icon="menu-up"
      >
        <b-table-column v-slot="props" field="agency_id" label="Agency ID">
          {{ props.row.agency_id }}
        </b-table-column>
        <b-table-column
          v-slot="props"
          field="agency_name"
          label="Name"
        >
          {{ props.row.agency_name }}
        </b-table-column>
      </b-table>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import TableViewerMixin from '~/components/table-viewer-mixin'

const q = gql`
query ($feed_version_sha1: String, $limit: Int, $after: Int, $search: String) {
  entities: agencies(after: $after, limit: $limit, where: {feed_version_sha1: $feed_version_sha1, search: $search}) {
    id
    agency_id
    agency_name
    agency_url
    feed_onestop_id
    feed_version_sha1
  }
}
`

export default {
  mixins: [TableViewerMixin],
  props: {
    fvid: { type: String, default () { return '' } }
  },
  data () {
    return {
      sortField: 'agency_id',
      sortOrder: 'asc'
    }
  },
  apollo: {
    entities: {
      query: q,
      variables () {
        return {
          search: this.search,
          feed_version_sha1: this.fvid,
          limit: this.limit
        }
      },
      error (e) { this.error = e }
    }
  }
}
</script>
