<template>
  <div>
    <b-tabs>
      <b-tab-item v-for="th in tripHeadsigns" :key="th.id" :label="th.trip_headsign">
        <div :key="st.id" v-for="st in th.stop_times">
          {{ st.stop_sequence }} {{ stopNames[st.stop_id] }} tp: {{ st.timepoint }}
        </div>
      </b-tab-item>
    </b-tabs>
  </div>
</template>

<script>
export default {
  props: ['tripHeadsigns', 'stops'],
  computed: {
    // sortedTripHeadsigns () {
    //   let ret = {};
    //   for (const [k,v] of Object.entries(this.tripHeadsigns)) {
    //     ret[k] =
    //   }
    //   return ret
    // },
    stopNames () {
      const stopNames = {}
      for (const stop of this.stops) {
        stopNames[stop.stop.id] = stop.stop.stop_name
      }
      return stopNames
    }
  }
}
</script>
