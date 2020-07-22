<template>
  <div>
    <b-message v-if="error" class="is-danger">
      {{ error }}
    </b-message>
    <span v-else-if="$apollo.loading" class="is-loading">Loading</span>
    <b-table
      :data="entities"
      :striped="true"
      :paginated="true"
      :total="total"
      :pagination-simple="true"
      sort-icon="menu-up"
      backend-pagination
      backend-sorting
      backend-filtering
      @sort="onSort"
      @page-change="onPageChange"
      @filters-change="onFilter"
    >
      <template slot-scope="props">
        <b-table-column field="agency_id" label="Agency ID">
          <nuxt-link
            :to="{name:'data-feed-versions-version-agencies-agency', params:{feed:props.row.feed_version.current_feed.onestop_id, version:props.row.feed_version.sha1, agency:props.row.agency_id}}"
          >
            {{ props.row.agency_id }}
          </nuxt-link>
        </b-table-column>
        <b-table-column
          field="agency_name"
          label="Name"
        >
          {{ props.row.agency_name }}
        </b-table-column>
        <b-table-column field="agency_url" label="URL">
          <a v-if="props.row.agency_url" :href="props.row.agency_url">
            <b-icon icon="link" />
          </a>
        </b-table-column>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  props: {
    fvid: { type: String, default () { return '' } }
  },
  data () {
    return {
      offset: 0,
      limit: 20,
      sortField: 'agency_id',
      sortOrder: 'asc',
      total: 0,
      entities: [],
      error: null
    }
  },
  methods: {
    onPageChange (page) {
      this.offset = this.limit * (page - 1)
    },
    onSort (field, order) {
      this.sortField = field
      this.sortOrder = order
    },
    onFilter (a) {
    }
  },
  apollo: {
    q: {
      query: require('~/graphql/feed-agencies.gql'),
      variables () {
        return {
          feed_version_sha1: this.fvid,
          offset: this.offset,
          limit: this.limit
        }
      },
      error (e) { this.error = e },
      update (data) {
        this.total = data.total.aggregate.count
        this.entities = data.entities
      }
    }
  }
}
</script>
