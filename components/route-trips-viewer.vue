<template>
  <div>
    <b-message v-if="error" class="is-danger">
      {{ error }}
    </b-message>
    <span v-else-if="$apollo.loading" class="is-loading">Loading</span>
    <div v-else-if="dirTrips.length === 0">
      No trips on {{ serviceDate }}.
    </div>
    <div v-else>
      <div>
        There are {{ dirTrips.length }} {{ dirDescription }} trips on {{ serviceDate }}.

        The first trip departs from <a href="">{{ dirTrips[0].first_stop_name }}</a> at {{ dirTrips[0].first_departure_time | formatHMS }} and makes {{ dirTrips[0].stop_times_count-1 }} stops before arriving at <a href="">{{ dirTrips[0].last_stop_name }}</a> at {{ dirTrips[0].last_arrival_time | formatHMS }}.

        The last trip departs from <a href="">{{ dirTrips[dirTrips.length-1].first_stop_name }}</a> at {{ dirTrips[dirTrips.length-1].first_departure_time | formatHMS }} and makes {{ dirTrips[dirTrips.length-1].stop_times_count-1 }} stops before arriving at <a href="">{{ dirTrips[dirTrips.length-1].last_stop_name }}</a> at {{ dirTrips[dirTrips.length-1].last_arrival_time | formatHMS }}.
      </div><br>

      <b-table
        :data="dirTrips"
        :striped="true"
        :default-sort="defaultSort"
        sort-icon="menu-up"
      >
        <b-table-column
          v-slot="props"
          :sortable="true"
          field="first_departure_time"
          label="Begin"
          width="120"
          numeric
        >
          {{ props.row.first_departure_time | formatHMS }}
        </b-table-column>
        <b-table-column
          v-slot="props"
          :sortable="true"
          field="last_arrival_time"
          label="End"
          width="120"
          numeric
        >
          {{ props.row.last_arrival_time | formatHMS }}
        </b-table-column>
        <b-table-column v-slot="props" :sortable="true" field="trip_headsign" label="Headsign">
          <nuxt-link :to="{name: 'data-feed-versions-version-routes-route-index-trips-trip', params:{feed:$route.params.feed, version:$route.params.version, trip: props.row.trip_id}}">
            {{ props.row.trip_short_name || props.row.trip_headsign || props.row.trip_id }}
          </nuxt-link>
        </b-table-column>
      </b-table>
    </div>
    <div />
  </div>
</template>

<script>
export default {
  props: {
    serviceDate: {
      type: String,
      default () { return '2020-07-16' }
    },
    feedVersionId: {
      type: Number, default () { return 0 }
    },
    routeId: {
      type: Number,
      default () { return 0 }
    },
    directionId: {
      type: Number,
      default () { return 0 }
    }
  },
  data () {
    return {
      defaultSort: ['first_departure_time', 'asc'],
      error: null
    }
  },
  computed: {
    dirDescription () {
      if (this.directionId === 0) {
        return 'inbound'
      }
      return 'outbound'
    },
    trips () {
      const trips = []
      for (const c of this.services_on_date || []) {
        for (const trip of c.trips || []) {
          trips.push({
            id: trip.id,
            direction_id: trip.direction_id,
            trip_headsign: trip.trip_headsign,
            trip_id: trip.trip_id,
            first_departure_time: trip.first_stop_time[0].departure_time,
            last_arrival_time: trip.last_stop_time[0].arrival_time,
            stop_times_count: trip.stop_times_aggregate.aggregate.count,
            first_stop_name: trip.first_stop_time[0].stop.stop_name,
            last_stop_name: trip.last_stop_time[0].stop.stop_name,
            at_stop_name: trip.at_stop_time[0] ? trip.at_stop_time[0].stop.stop_name : null,
            at_stop_time: trip.at_stop_time[0] ? trip.at_stop_time[0].arrival_time : null
          })
        }
      }
      return trips
    },
    dirTrips () {
      return this.trips.filter((t) => { return t.direction_id === this.directionId }).sort((a, b) => { return a.first_departure_time - b.first_departure_time })
    }
  },
  apollo: {
    services_on_date: {
      query: require('~/graphql/feed-version-route-trips.gql'),
      error (e) { this.error = e },
      variables () {
        return {
          route_id: this.routeId,
          feed_version_id: this.feedVersionId,
          service_date: this.serviceDate,
          at_stop_id: 0
        }
      }
    }
  }
}
</script>
