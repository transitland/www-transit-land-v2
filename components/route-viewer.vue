<template>
  <b-table
    :data="routes"
    :striped="true"
    :paginated="true"
    :total="total"
    pagination-position="top"
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
      <b-table-column
        field="route_id"
        label="route_id"
      >
        <nuxt-link
          :to="{name:'data-feed-versions-version-routes-route', params:{feed:feedId, version:fvid, route:props.row.route_id}}"
        >
          {{ props.row.route_id }}
        </nuxt-link>
      </b-table-column>
      <b-table-column
        field="route_short_name"
        label="route_short_name"
      >
        {{ props.row.route_short_name }}
      </b-table-column>
      <b-table-column
        field="route_long_name"
        label="route_long_name"
      >
        {{ props.row.route_long_name }}
      </b-table-column>
      <b-table-column field="route_url" label="route_url">
        <a v-if="props.row.route_url" :href="props.row.route_url">
          <b-icon icon="link" />
        </a>
      </b-table-column>
    </template>
  </b-table>
</template>

<script>
export default {
  props: ['fvid', 'feedId'],
  data () {
    return {
      offset: 0,
      limit: 20,
      total: 0,
      routes: []
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
      alert('ok')
      this.filterRouteID = a.route_id ? `%${a.route_id}%` : null
      this.filterRouteShortName = a.route_short_name
        ? `%${a.route_short_name}%`
        : null
      this.filterRouteLongName = a.route_long_name
        ? `%${a.route_long_name}%`
        : null
    }
  },
  apollo: {
    q: {
      query: require('~/graphql/feed-version-routes.gql'),
      variables () {
        return {
          feed_version_sha1: this.fvid,
          offset: this.offset,
          limit: this.limit,
          route_id: this.filterRouteID,
          route_short_name: this.filterRouteShortName,
          route_long_name: this.filterRouteLongName
        }
      },
      update (data) {
        this.total = data.total.aggregate.count
        this.routes = data.routes
      }
    }
  }
}
</script>
