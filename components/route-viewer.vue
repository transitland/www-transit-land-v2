<template>
  <div>
    <b-message v-if="error" class="is-danger">
      {{ error }}
    </b-message>
    <b-table
      v-else
      :loading="$apollo.loading"
      :data="entityPage"
      :striped="true"
      :per-page="perPage"
      :paginated="true"
      :current-page.sync="page"
      :total="total"
      sort-icon="menu-up"
      backend-pagination
      backend-sorting
      backend-filtering
      @sort="onSort"
    >
      <b-table-column
        v-slot="props"
        field="route_id"
        label="Route ID"
        :sortable="true"
        :width="140"
      >
        <nuxt-link
          :to="{name:'data-feed-versions-version-routes-route', params:{feed:props.row.feed_version.current_feed.onestop_id, version:props.row.feed_version.sha1, route:props.row.route_id}}"
        >
          {{ props.row.route_id }}
        </nuxt-link>
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="route_short_name"
        label="Name"
        :sortable="true"
        :width="140"
      >
        {{ props.row.route_short_name }}
      </b-table-column>
      <b-table-column
        v-slot="props"
        :sortable="true"
        field="route_long_name"
        label=""
        :width="500"
      >
        {{ props.row.route_long_name }}
      </b-table-column>

      <b-table-column v-slot="props" field="route_url" label=" ">
        <a v-if="props.row.route_url" target="_blank" :href="props.row.route_url">
          <b-icon icon="link" />
        </a>
      </b-table-column>

      <b-table-column v-if="showAgency" v-slot="props" field="agency" label="Agency">
        {{ props.row.agency.agency_name }}
      </b-table-column>

      <b-table-column v-if="showGeometry" v-slot="props" field="geometry" label="Shape" :width="60">
        <template v-if="props.row.geometries.filter((s)=>{return s.generated === true}).length > 0">
          <b-tooltip label="This route contains generated shapes">
            <b-icon icon="alert" type="is-grey-light" />
          </b-tooltip>
        </template>
        <template v-else-if="props.row.geometries.filter((s)=>{return s.generated === false}).length > 0">
          <b-icon icon="check" type="is-grey-dark" />
        </template>
        <template v-else>
          <b-tooltip label="No shape information was present or generated">
            <b-icon type="is-warning" icon="alert" />
          </b-tooltip>
        </template>
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="headways"
        label="Headway"
        :numeric="true"
        :sortable="true"
        :width="100"
      >
        <span v-if="props.row.headways_weekday && props.row.headways_weekday.headway_secs">
          <b-tooltip
            :label="headwayTooltip(props.row.headways)"
            :dashed="true"
            multilined
          >
            {{ Math.ceil(props.row.headways_weekday.headway_secs / 60) }} mins
          </b-tooltip>
        </span>
      </b-table-column>
    </b-table>
  </div>
</template>

<script>
import TableViewerMixin from '~/components/table-viewer-mixin'

export default {
  mixins: [TableViewerMixin],
  props: {
    fvids: { type: Array, default: null },
    agencyIds: { type: Array, default: null },
    routeIds: { type: Array, default: null },
    showAgency: { type: Boolean, default: true },
    showGeometry: { type: Boolean, default: true }
  },
  data () {
    return {
      sortField: 'headways',
      sortOrder: 'asc'
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
Weekday Afternoon: ${fmt(ret.weekday, 'afternoon')} mins
Weekday Night: ${fmt(ret.weekday, 'night')} mins`
    }
  },
  apollo: {
    q: {
      query: require('~/graphql/feed-version-routes.gql'),
      variables () {
        let orderby = {}
        if (this.sortField === 'headways') {
          orderby = { headways_weekday: { headway_secs: this.sortOrder }, route_id: 'asc' }
        } else {
          orderby = this.orderBy
        }
        return {
          offset: this.entityOffset,
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
        this.entities = data.routes
      }
    }
  }
}
</script>
