<template>
  <div>
    <b-message v-if="error" class="is-danger">
      {{ error }}
    </b-message>
    <span v-else-if="$apollo.loading" class="is-loading">Loading</span>
    <b-table
      v-else
      :data="stops"
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
        <b-table-column field="stop_id" label="Stop ID">
          <nuxt-link
            :to="{name:'data-feed-versions-version-stops-stop', params:{feed:props.row.feed_version.current_feed.onestop_id, version:props.row.feed_version.sha1, stop:props.row.stop_id}}"
          >
            {{ props.row.stop_id }}
          </nuxt-link>
        </b-table-column>
        <b-table-column
          field="stop_name"
          label="Name"
        >
          {{ props.row.stop_name }}
        </b-table-column>
        <b-table-column field="stop_url" label="URL">
          <a v-if="props.row.stop_url" target="_blank" :href="props.row.stop_url">
            <b-icon icon="link" />
          </a>
        </b-table-column>

        <b-table-column v-if="showAgencies" field="agencies" label="Agencies">
          {{ props.row.route_stops.map((s)=>{return s.agency.agency_name}) | joinUnique }}
        </b-table-column>
        <b-table-column v-if="showRoutes" field="routes" label="Routes">
          {{ props.row.route_stops.map((s)=>{return s.route.route_short_name}) | joinUnique }}
        </b-table-column>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  props: {
    fvids: { type: Array, default: null },
    agencyIds: { type: Array, default: null },
    routeIds: { type: Array, default: null },
    showAgencies: { type: Boolean, default: true },
    showRoutes: { type: Boolean, default: true }
  },
  data () {
    return {
      offset: 0,
      limit: 20,
      sortField: 'stop_id',
      sortOrder: 'asc',
      total: 0,
      stops: [],
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
      query: require('~/graphql/feed-stops.gql'),
      variables () {
        return {
          feed_version_ids: this.fvids,
          route_ids: this.routeIds,
          agency_ids: this.agencyIds,
          offset: this.offset,
          limit: this.limit
        }
      },
      error (e) { this.error = e },
      update (data) {
        this.total = data.total.aggregate.count
        this.stops = data.stops
      }
    }
  }
}
</script>
