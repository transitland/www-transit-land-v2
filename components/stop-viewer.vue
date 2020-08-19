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
      <template slot-scope="props">
        <b-table-column
          field="stop_id"
          label="Stop ID"
          :sortable="true"
          :width="140"
        >
          <nuxt-link
            :to="{name:'data-feed-versions-version-stops-stop', params:{feed:props.row.feed_version.current_feed.onestop_id, version:props.row.feed_version.sha1, stop:props.row.stop_id}}"
          >
            {{ props.row.stop_id }}
          </nuxt-link>
        </b-table-column>
        <b-table-column
          field="stop_name"
          label="Name"
          :sortable="true"
          :width="600"
        >
          {{ props.row.stop_name }}
        </b-table-column>
        <b-table-column
          field="stop_url"
          label="URL"
          :width="100"
        >
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
import TableViewerMixin from '~/components/table-viewer-mixin'

export default {
  mixins: [TableViewerMixin],
  props: {
    fvids: { type: Array, default: null },
    agencyIds: { type: Array, default: null },
    routeIds: { type: Array, default: null },
    showAgencies: { type: Boolean, default: true },
    showRoutes: { type: Boolean, default: true }
  },
  data () {
    return {
      sortField: 'stop_id',
      sortOrder: 'asc'
    }
  },
  apollo: {
    q: {
      query: require('~/graphql/feed-stops.gql'),
      variables () {
        return {
          offset: this.entityOffset,
          limit: this.limit,
          agency_ids: this.agencyIds,
          route_ids: this.routeIds,
          feed_version_ids: this.fvids,
          order_by: this.orderBy
        }
      },
      error (e) { this.error = e },
      update (data) {
        this.total = data.total.aggregate.count
        this.entities = data.stops
      }
    }
  }
}
</script>
