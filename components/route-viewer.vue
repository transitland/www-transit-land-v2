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
        label="Route ID"
        :sortable="true"
      >
        <nuxt-link
          :to="{name:'data-feed-versions-version-routes-route', params:{feed:feedId, version:fvid, route:props.row.route_id}}"
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
        <a v-if="props.row.route_url" :href="props.row.route_url">
          <b-icon icon="link" />
        </a>
      </b-table-column>

      <b-table-column field="headways" label="Headway" :numeric="true" :sortable="true">
        <span v-if="props.row.headways_weekday && props.row.headways_weekday.headway_seconds_morning_mid">
          <b-tooltip
            :label="headwayTooltip(props.row.headways)"
            :dashed="true"
            multilined
          >
            {{ props.row.headways_weekday | formatHeadway('morning') }} mins
          </b-tooltip>

        </span>
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
      routes: [],
      sortField: null,
      sortOrder: null
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
Weekday Late night: ${fmt(ret.weekday, 'latenight')} mins

Saturday Morning: ${fmt(ret.saturday, 'morning')} mins
Saturday Midday: ${fmt(ret.saturday, 'midday')} mins
Saturday Evening: ${fmt(ret.saturday, 'evening')} mins
Saturday Late night: ${fmt(ret.saturday, 'latenight')} mins

Sunday Morning: ${fmt(ret.sunday, 'morning')} mins
Sunday Midday: ${fmt(ret.sunday, 'midday')} mins
Sunday Evening: ${fmt(ret.sunday, 'evening')} mins
Sunday Late night: ${fmt(ret.sunday, 'latenight')} mins
      `
    },
    onPageChange (page) {
      this.offset = this.limit * (page - 1)
    },
    onSort (field, order) {
      console.log('onSort', field, order)
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
        let orderby = {}
        if (this.sortField === 'headways') {
          orderby = { headways_weekday: { headway_seconds_morning_mid: this.sortOrder } }
        } else if (this.sortField) {
          orderby[this.sortField] = this.sortOrder
        } else {
          orderby = { headways_weekday: { headway_seconds_morning_mid: 'asc' } }
        }

        return {
          feed_version_sha1: this.fvid,
          offset: this.offset,
          limit: this.limit,
          route_id: this.filterRouteID,
          route_short_name: this.filterRouteShortName,
          route_long_name: this.filterRouteLongName,
          order_by: orderby
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
