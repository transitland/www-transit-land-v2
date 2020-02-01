<template>
  <b-table
    :data="stopTimes"
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
      <b-table-column label="trip_id" field="trip_id">
        {{ props.row.trip.trip_id }}
      </b-table-column>
      <b-table-column label="stop_sequence" field="stop_sequence">
        {{ props.row.stop_sequence }}
      </b-table-column>
      <b-table-column label="stop_id" field="stop_id">
        {{ props.row.stop.stop_id }}
      </b-table-column>
      <b-table-column label="arrival_time" field="arrival_time">
        {{ props.row.arrival_time | formatWT }}
      </b-table-column>
      <b-table-column label="departure_time" field="departure_time">
        {{ props.row.departure_time | formatWT }}
      </b-table-column>
      <b-table-column label="stop_headsign" field="stop_headsign">
        {{ props.row.stop_headsign }}
      </b-table-column>
      <b-table-column label="timepoint" field="timepoint">
        {{ props.row.timepoint }}
      </b-table-column>
    </template>
  </b-table>
</template>

<script>
export default {
  props: ['fvid', 'tripId'],
  data () {
    return {
      filterTripID: null,
      filterTripShortName: null,
      filterTripHeadsign: null,
      offset: 0,
      limit: 20,
      sortField: 'trip_id',
      sortOrder: 'asc',
      total: 0,
      stopTimes: []
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
      query: require('~/graphql/feed-stop-times.gql'),
      variables () {
        return {
          feed_version_sha1: this.fvid,
          trip_id: this.tripId,
          offset: this.offset,
          limit: this.limit
        }
      },
      update (data) {
        this.total = data.total.aggregate.count
        this.stopTimes = data.gtfs_stop_times
      }
    }
  }
}
</script>
