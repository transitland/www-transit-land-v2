<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">
        Trip Viewer
      </p>
    </header>
    <section class="modal-card-body">
      <b-table
        :data="trips"
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
          <b-table-column :searchable="true" field="trip_id" label="trip_id">
            {{ props.row.trip_id }}
          </b-table-column>
          <b-table-column
            :searchable="true"
            field="trip_headsign"
            label="trip_headsign"
          >
            {{ props.row.trip_headsign }}
          </b-table-column>
          <b-table-column
            :searchable="true"
            field="trip_short_name"
            label="trip_short_name"
          >
            {{ props.row.trip_short_name }}
          </b-table-column>
        </template>
      </b-table>
    </section>
  </div>
</template>

<script>
export default {
  props: ['fvid'],
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
      trips: []
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
      this.filterTripID = a.trip_id ? `%${a.trip_id}%` : null
      this.filterTripShortName = a.trip_short_name
        ? `%${a.trip_short_name}%`
        : null
      this.filterTripHeadsign = a.trip_headsign ? `%${a.trip_headsign}%` : null
    }
  },
  apollo: {
    q: {
      query: require('~/graphql/feed-trips.gql'),
      variables () {
        return {
          feed_version_sha1: this.fvid,
          offset: this.offset,
          limit: this.limit,
          trip_id: this.filterTripID,
          trip_short_name: this.filterTripShortName,
          trip_headsign: this.filterTripHeadsign
        }
      },
      update (data) {
        this.total = data.total.aggregate.count
        this.trips = data.trips
      }
    }
  }
}
</script>
