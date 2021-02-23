<template>
  <div>
    <b-message v-if="error" class="is-danger">
      {{ error }}
    </b-message>
    <div v-else>
      <search-bar v-model="search" placeholder="Filter Stops" />
      <b-table
        :loading="$apollo.loading"
        :data="entityPage"
        :striped="true"
        sort-icon="menu-up"
      >
        <b-table-column
          v-slot="props"
          field="stop_id"
          label="Stop ID"
          :width="140"
        >
          <nuxt-link
            :to="{name:'stops-onestop_id', params:{onestop_id:props.row.onestop_id}, query: (linkVersion ? {feed_onestop_id:props.row.feed_onestop_id, feed_version_sha1:props.row.feed_version_sha1, stop_id:props.row.stop_id} : {})}"
          >
            {{ props.row.stop_id }}
          </nuxt-link>
        </b-table-column>
        <b-table-column
          v-slot="props"
          field="stop_name"
          label="Name"
          :width="600"
        >
          {{ props.row.stop_name }}
        </b-table-column>

        <b-table-column v-if="showAgencies" v-slot="props" field="agencies" label="Agencies">
          {{ props.row.route_stops.map((s)=>{return s.agency.agency_name}) | joinUnique }}
        </b-table-column>
        <b-table-column v-if="showRoutes" v-slot="props" field="routes" label="Routes">
          {{ props.row.route_stops.map((s)=>{return s.route.route_short_name}) | joinUnique }}
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
query ($feed_version_sha1: String, $agency_ids: [Int!], $limit: Int, $after: Int, $search: String) {
  entities: stops(after: $after, limit: $limit, where: {agency_ids: $agency_ids, feed_version_sha1: $feed_version_sha1, search: $search}) {
    id
    feed_onestop_id
    feed_version_sha1
    onestop_id
    stop_id
    stop_name
    stop_code
    stop_desc
    stop_url
    location_type
    wheelchair_boarding
    route_stops {
      route {
        route_id
        route_short_name
        route_long_name
      }
    }
  }
}
`

export default {
  mixins: [TableViewerMixin],
  props: {
    showRoutes: { type: Boolean, default: true },
    showAgencies: { type: Boolean, default: false },
    feedVersionSha1: { type: String, default: null },
    agencyIds: { type: Array, default () { return [] } },
    linkVersion: { type: Boolean, default: false }
  },
  data () {
    return {
      sortField: 'stop_id',
      sortOrder: 'asc'
    }
  },
  apollo: {
    entities: {
      query: q,
      variables () {
        return {
          search: this.search,
          limit: this.limit,
          feed_version_sha1: this.feedVersionSha1,
          agency_ids: this.agencyIds
        }
      },
      error (e) { this.error = e }
    }
  }
}
</script>
