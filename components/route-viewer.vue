<template>
  <div>
    <b-message v-if="error" class="is-danger">
      {{ error }}
    </b-message>
    <div v-else>
      <search-bar v-model="search" placeholder="Filter Routes" />
      <b-table
        :loading="$apollo.loading"
        :data="entityPage"
        :striped="true"
      >
        <b-table-column
          v-slot="props"
          field="route_id"
          label="Route ID"
          :width="140"
        >
          <nuxt-link
            :to="{name:'routes-onestop_id', params:{onestop_id:props.row.onestop_id || 'search'}, query: (linkVersion ? {feed_onestop_id:props.row.feed_onestop_id, feed_version_sha1:props.row.feed_version_sha1, route_id:props.row.route_id} : {})}"
          >
            {{ props.row.route_id }}
          </nuxt-link>
        </b-table-column>

        <b-table-column
          v-slot="props"
          field="route_short_name"
          label="Name"
          :width="140"
        >
          {{ props.row.route_short_name }}
        </b-table-column>
        <b-table-column
          v-slot="props"
          field="route_long_name"
          label=""
          :width="500"
        >
          {{ props.row.route_long_name }}
        </b-table-column>

        <b-table-column v-if="showAgency" v-slot="props" field="agency" label="Agency">
          {{ props.row.agency.agency_name }}
        </b-table-column>

        <b-table-column v-if="showGeometry" v-slot="props" field="geometry" label="Shape" :width="60">
          <template v-if="(props.row.geometries || []).filter((s)=>{return s.generated === true}).length > 0">
            <b-tooltip label="This route contains generated shapes">
              <b-icon icon="alert" type="is-grey-light" />
            </b-tooltip>
          </template>
          <template v-else-if="(props.row.geometries || []).filter((s)=>{return s.generated === false}).length > 0">
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
          :width="100"
        >
          <b-tooltip
            v-if="props.row.headway_seconds_weekday_morning"
            :label="headwayTooltip(props.row.headways)"
            :dashed="true"
            multilined
          >
            {{ Math.ceil(props.row.headway_seconds_weekday_morning / 60) }} mins
          </b-tooltip>
        </b-table-column>
      </b-table>
      <show-more v-if="entities.length === limit || hasMore" :limit="entities.length" @click="showAll" />
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import TableViewerMixin from '~/components/table-viewer-mixin'

const q = gql`
query($after: Int, $limit: Int, $feed_version_sha1: String, $agency_ids: [Int!], $search: String) {
  entities: routes(after: $after, limit: $limit, where: { search: $search, feed_version_sha1: $feed_version_sha1, agency_ids: $agency_ids }) {
    id
    onestop_id
    feed_version_sha1
    feed_onestop_id
    route_id
    route_short_name
    route_long_name
    route_type
    route_url
    agency {
      id
      agency_id
      agency_name
    }
    geometries {
      direction_id
      generated
    }
    headway_seconds_weekday_morning
    headways {
      # selected_stop_id
      # service_date
      dow_category
      headway_seconds_morning_min
      headway_seconds_midday_min
      headway_seconds_afternoon_min
      headway_seconds_night_min
      headway_seconds_morning_mid
      headway_seconds_midday_mid
      headway_seconds_afternoon_mid
      headway_seconds_night_mid
      headway_seconds_morning_max
      headway_seconds_midday_max
      headway_seconds_afternoon_max
      headway_seconds_night_max
    }
  }
}
`

export default {
  mixins: [TableViewerMixin],
  props: {
    feedVersionSha1: { type: String, default: null },
    fvids: { type: Array, default: null },
    agencyIds: { type: Array, default: null },
    routeIds: { type: Array, default: null },
    showAgency: { type: Boolean, default: true },
    showGeometry: { type: Boolean, default: true },
    linkVersion: { type: Boolean, default: false }
  },
  apollo: {
    entities: {
      query: q,
      variables () {
        return {
          limit: this.limit,
          search: this.search,
          feed_version_sha1: this.feedVersionSha1,
          agency_ids: this.agencyIds
        }
      },
      error (e) { this.error = e }
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
  }
}
</script>
