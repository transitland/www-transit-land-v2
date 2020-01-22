<template>
  <div>
    <b-tabs v-if="!this.$apollo.loading">
      <b-tab-item v-if="inboundTrips.length === 0 && outboundTrips.length === 0" label="No scheduled service">
        There are no scheduled trips on {{ serviceDate }}.
      </b-tab-item>
      <b-tab-item v-if="inboundTrips.length > 0" label="Inbound">
        <div>
          There are {{ inboundTrips.length }} inbound trips on {{ serviceDate }}.

          The first trip departs from <a href="">{{ inboundTrips[0].first_stop_name }}</a> at {{ inboundTrips[0].first_departure_time | formatHMS }} and makes {{ inboundTrips[0].stop_times_count-1 }} stops before arriving at <a href="">{{ inboundTrips[0].last_stop_name }}</a> at {{ inboundTrips[0].last_arrival_time | formatHMS }}.

          The last trip departs from <a href="">{{ inboundTrips[inboundTrips.length-1].first_stop_name }}</a> at {{ inboundTrips[inboundTrips.length-1].first_departure_time | formatHMS }} and makes {{ inboundTrips[inboundTrips.length-1].stop_times_count-1 }} stops before arriving at <a href="">{{ inboundTrips[inboundTrips.length-1].last_stop_name }}</a> at {{ inboundTrips[inboundTrips.length-1].last_arrival_time | formatHMS }}.
        </div><br>

        <b-table
          :data="inboundTrips"
          :striped="true"
          :default-sort="defaultSort"
          :paginated="true"
          :pagination-simple="true"
          sort-icon="menu-up"
          pagination-position="top"
        >
          <template slot-scope="props">
            <b-table-column :sortable="true" field="first_departure_time" label="Begin" width="120" numeric>
              {{ props.row.first_departure_time | formatHMS }}
            </b-table-column>
            <b-table-column :sortable="true" field="last_arrival_time" label="End" width="120" numeric>
              {{ props.row.last_arrival_time | formatHMS }}
            </b-table-column>
            <b-table-column :sortable="true" field="trip_headsign" label="Headsign">
              {{ props.row.trip_headsign }}
            </b-table-column>
          </template>
        </b-table>
      </b-tab-item>

      <b-tab-item v-if="outboundTrips.length > 0" label="Outbound">
        <div>
          There are {{ outboundTrips.length }} outbound trips on {{ serviceDate }}.

          The first trip departs from <a href="">{{ outboundTrips[0].first_stop_name }}</a> at {{ outboundTrips[0].first_departure_time | formatHMS }} and makes {{ outboundTrips[0].stop_times_count-1 }} stops before arriving at <a href="">{{ outboundTrips[0].last_stop_name }}</a> at {{ outboundTrips[0].last_arrival_time | formatHMS }}.

          The last trip departs from <a href="">{{ outboundTrips[outboundTrips.length-1].first_stop_name }}</a> at {{ outboundTrips[outboundTrips.length-1].first_departure_time | formatHMS }} and makes {{ outboundTrips[outboundTrips.length-1].stop_times_count-1 }} stops before arriving at <a href="">{{ outboundTrips[outboundTrips.length-1].last_stop_name }}</a> at {{ outboundTrips[outboundTrips.length-1].last_arrival_time | formatHMS }}.
        </div><br>

        <b-table
          :data="outboundTrips"
          :striped="true"
          :default-sort="defaultSort"
          :paginated="true"
          :pagination-simple="true"
          sort-icon="menu-up"
          pagination-position="top"
        >
          <template slot-scope="props">
            <b-table-column :sortable="true" field="first_departure_time" label="Begin" width="120" numeric>
              {{ props.row.first_departure_time | formatHMS }}
            </b-table-column>
            <b-table-column :sortable="true" field="last_arrival_time" label="End" width="120" numeric>
              {{ props.row.last_arrival_time | formatHMS }}
            </b-table-column>
            <b-table-column :sortable="true" field="trip_headsign" label="Headsign">
              {{ props.row.trip_headsign }}
            </b-table-column>
          </template>
        </b-table>
      </b-tab-item>
    </b-tabs>
  </div>
</template>

<script>
export default {
  props: ['route'],
  data () {
    return {
      defaultSort: ['first_departure_time', 'asc'],
      serviceDate: this.$route.params.date
    }
  },
  computed: {
    trips () {
      const trips = []
      for (const c of this.services_on_date || []) {
        for (const trip of c.trips || []) {
          trips.push({
            id: trip.id,
            direction_id: trip.direction_id,
            trip_headsign: trip.trip_headsign,
            first_departure_time: trip.first_stop_time[0].departure_time,
            last_arrival_time: trip.last_stop_time[0].arrival_time,
            stop_times_count: trip.stop_times_aggregate.aggregate.count,
            first_stop_name: trip.first_stop_time[0].stop.stop_name,
            last_stop_name: trip.last_stop_time[0].stop.stop_name
          })
        }
      }
      return trips
    },
    inboundTrips () {
      return this.trips.filter((t) => { return t.direction_id === 0 }).sort((a, b) => { return a.first_departure_time - b.first_departure_time })
    },
    outboundTrips () {
      return this.trips.filter((t) => { return t.direction_id === 1 }).sort((a, b) => { return a.first_departure_time - b.first_departure_time })
    }
  },
  apollo: {
    services_on_date: {
      query: require('~/graphql/route_trips.gql'),
      variables () {
        return {
          route_id: this.route.id,
          feed_version_id: this.route.feed_version_id,
          service_date: this.$route.params.date
        }
      }
    }
  }
}
</script>
