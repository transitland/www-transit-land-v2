<template>
  <div>
    <headway-viewer :headways="entity.headways" />

    <b-tabs type="is-boxed">
      <b-tab-item v-for="(hw,key) of hws" :key="key" :label="key">
        <debug-stop-viewer
          :fvid="entity.feed_version_id"
          :routeid="entity.id"
          :stopid="hw.selected_stop_id"
          :directionid="hw.direction_id"
          :servicedate="hw.service_date"
        />
      </b-tab-item>
    </b-tabs>
  </div>
</template>

<script>
import DebugStopViewer from '~/components/debug-stop-viewer'
import HeadwayViewer from '~/components/headway-viewer'

export default {
  components: { DebugStopViewer, HeadwayViewer },
  props: {
    entity: { type: Object, default () { return {} } }
  },
  computed: {
    hws () {
      const hwlookup = {
        1: 'weekday',
        6: 'saturday',
        7: 'sunday'
      }
      const ret = { weekday: {}, saturday: {}, sunday: {} }
      for (const hw of (this.entity.headways || [])) {
        ret[hwlookup[hw.dow_category]] = hw
      }
      return ret
    }
  }
}
</script>
