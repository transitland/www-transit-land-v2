<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">
        Stop Viewer
      </p>
    </header>
    <section class="modal-card-body">
      <b-table
        :data="stops"
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
          <b-table-column :searchable="true" field="stop_id" label="stop_id">
            {{ props.row.stop_id }}
          </b-table-column>
          <b-table-column
            :searchable="true"
            field="stop_name"
            label="stop_name"
          >
            {{ props.row.stop_name }}
          </b-table-column>
          <b-table-column field="stop_desc" label="stop_desc">
            {{ props.row.stop_desc }}
          </b-table-column>
          <b-table-column field="stop_code" label="stop_code">
            {{ props.row.stop_code }}
          </b-table-column>
          <b-table-column field="stop_url" label="stop_url">
            <a v-if="props.row.stop_url" :href="props.row.stop_url">
              <b-icon icon="link" />
            </a>
          </b-table-column>

          <b-table-column field="location_type" label="location_type">
            {{ props.row.location_type }}
          </b-table-column>
          <b-table-column
            field="wheelchair_boarding"
            label="wheelchair_boarding"
          >
            {{ props.row.wheelchair_boarding }}
          </b-table-column>
        </template>
      </b-table>
    </section>
  </div>
</template>

<script>
export default {
  props: ['fvid', 'filterStopID', 'filterStopName'],
  data () {
    return {
      offset: 0,
      limit: 20,
      sortField: 'stop_id',
      sortOrder: 'asc',
      total: 0,
      stops: []
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
      this.filterStopID = a.stop_id ? `%${a.stop_id}%` : null
      this.filterStopName = a.stop_name ? `%${a.stop_name}%` : null
    }
  },
  apollo: {
    q: {
      query: require('~/graphql/feed-stops.gql'),
      variables () {
        return {
          feed_version_sha1: this.fvid,
          offset: this.offset,
          limit: this.limit,
          stop_id: this.filterStopID,
          stop_name: this.filterStopName
        }
      },
      update (data) {
        this.total = data.total.aggregate.count
        this.stops = data.stops
      }
    }
  }
}
</script>
