<template>
  <div>
    <div>
      args: fvid {{ fvid }} route_id {{ routeid }} stop_id {{ stopid }}  direction_id {{ directionid }} service_date {{ servicedate }}
    </div>
    <div v-for="(value,key) of bycat" :key="key">
      {{ key }}: {{ value }}
    </div>
    <div class="content">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Trip</th>
            <th>Time</th>
            <th>Raw time</th>
            <th>Stop</th>
            <th>Since last stop</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(st,i) of sts" :key="st.id">
            <td>{{ servicedate }}</td>
            <td>{{ st.tid }}</td>
            <td>{{ st.departure_time | formatHMS }}</td>
            <td>{{ st.departure_time }}</td>
            <td>{{ st.stop.stop_name }}</td>
            <td>
              <span v-if="i>0">
                {{ st.departure_time - sts[i-1].departure_time }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'

const q = gql`
query(
  $feed_version_id:bigint!, $service_date:date!, $route_id:bigint!, $stop_id:bigint!, $direction_id:Int!){
  services_on_date(args: {fvid: $feed_version_id, service_date: $service_date}) {
    id
    start_date
    end_date
    trips(where:{direction_id:{_eq:$direction_id}, route_id:{_eq:$route_id}}) {
      trip_id
      stop_times(limit: 1, where:{stop_id:{_eq:$stop_id}}) {
        id
        arrival_time
        departure_time
        stop {
          id
          stop_name
        }
      }
    }
  }
}
`

export default {
  props: {
    fvid: { type: Number, default: 0 },
    routeid: { type: Number, default: 0 },
    stopid: { type: Number, default: 0 },
    directionid: { type: Number, default: 0 },
    servicedate: { type: String, default: '' }
  },
  data () {
    return {
      services_on_date: []
    }
  },
  computed: {
    sts () {
      const ret = []
      for (const sod of this.services_on_date || []) {
        for (const trip of sod.trips || []) {
          for (const st of trip.stop_times || []) {
            ret.push(Object.assign({ tid: trip.trip_id }, st))
          }
        }
      }
      return ret.sort((a, b) => { return a.departure_time - b.departure_time })
    },
    bycat () {
      const ret = {
        morning: [],
        midday: [],
        afternoon: [],
        night: []
      }
      for (const st of this.sts) {
        if (st.departure_time >= (6 * 3600) && st.departure_time < (10 * 3600)) {
          ret.morning.push(st)
        } else if (st.departure_time >= (10 * 3600) && st.departure_time < (16 * 3600)) {
          ret.midday.push(st)
        } else if (st.departure_time >= (16 * 3600) && st.departure_time < (20 * 3600)) {
          ret.afternoon.push(st)
        } else {
          ret.night.push(st)
        }
      }
      const ret2 = {}
      for (const [k, v] of Object.entries(ret)) {
        const dts = v.map((s) => { return s.departure_time })
        const hws = []
        for (let i = 1; i < dts.length; i++) {
          hws.push(dts[i] - dts[i - 1])
        }
        ret2[k] = hws
      }
      return ret2
    }
  },
  apollo: {
    services_on_date: {
      query: q,
      variables () {
        return {
          feed_version_id: this.fvid,
          route_id: this.routeid,
          stop_id: this.stopid,
          direction_id: this.directionid,
          service_date: this.servicedate
        }
      }
    }
  }
}
</script>
