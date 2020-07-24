<template>
  <div>
    <b-message v-if="error" class="is-danger">
      {{ error }}
    </b-message>
    <span v-else-if="$apollo.loading" class="is-loading">Loading</span>
    <b-table
      v-else
      :data="routes"
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
        <b-table-column
          field="route_id"
          label="Route ID"
          :sortable="true"
        >
          <nuxt-link
            :to="{name:'data-feed-versions-version-routes-route', params:{feed:props.row.feed_version.current_feed.onestop_id, version:props.row.feed_version.sha1, route:props.row.route_id}}"
          >
            {{ props.row.route_id }}
          </nuxt-link>
        </b-table-column>

        <b-table-column
          :sortable="true"
          field="route_short_name"
          label="Name"
        >
          {{ props.row.route_short_name }}
        </b-table-column>
        <b-table-column
          :sortable="true"
          field="route_long_name"
          label=""
        >
          {{ props.row.route_long_name }}
        </b-table-column>

        <b-table-column field="route_url" label=" ">
          <a v-if="props.row.route_url" target="_blank" :href="props.row.route_url">
            <b-icon icon="link" />
          </a>
        </b-table-column>

        <b-table-column v-if="showAgency" field="agency" label="Agency">
          {{ props.row.agency.agency_name }}
        </b-table-column>

        <b-table-column field="headways" label="Headway" :numeric="true" :sortable="true">
          <span v-if="props.row.headways_weekday && props.row.headways_weekday.headway_secs">
            <b-tooltip
              :label="headwayTooltip(props.row.headways)"
              :dashed="true"
              multilined
            >
              {{ props.row.headways_weekday.headway_secs }}
            </b-tooltip>
          </span>
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
    showAgency: { type: Boolean, default: true }
  },
  data () {
    return {
      offset: 0,
      limit: 20,
      total: 0,
      routes: [],
      sortField: null,
      sortOrder: null,
      error: null
    }
  },
  methods: {
    headwayTooltip (hws) {
      // Buefy 0.9 will have a tooltip slot and we can use HeadwaysViewer
      const hwlookup = {
        1: 'weekday',
        6: 'saturday',
        7: 'sunday'
      }
      const ret = { weekday: {}, saturday: {}, sunday: {} }
      for (const hw of (hws || [])) {
        ret[hwlookup[hw.dow_category]] = hw
      }
      const fmt = this.$options.filters.formatHeadway
      return `
Weekday Morning: ${fmt(ret.weekday, 'morning')} mins
Weekday Midday: ${fmt(ret.weekday, 'midday')} mins
Weekday Evening: ${fmt(ret.weekday, 'evening')} mins
Weekday Late night: ${fmt(ret.weekday, 'latenight')} mins`
    },
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
      query: require('~/graphql/feed-version-routes.gql'),
      variables () {
        let orderby = {}
        if (this.sortField === 'headways') {
          orderby = { headways_weekday: { headway_secs: this.sortOrder } }
        } else if (this.sortField) {
          orderby[this.sortField] = this.sortOrder
        } else {
          orderby = { headways_weekday: { headway_secs: 'asc' }, route_id: 'asc' }
        }
        return {
          offset: this.offset,
          limit: this.limit,
          agency_ids: this.agencyIds,
          route_ids: this.routeIds,
          feed_version_ids: this.fvids,
          order_by: orderby
        }
      },
      error (e) { this.error = e },
      update (data) {
        this.total = data.total.aggregate.count
        this.routes = data.routes
      }
    }
  }
}
</script>
