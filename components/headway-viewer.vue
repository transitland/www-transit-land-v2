<template>
  <div class="content">
    <table>
      <thead>
        <tr>
          <th />
          <th>Morning<br><span class="tag is-small is-centered">6-10am</span></th>
          <th>Midday<br><span class="tag is-small is-centered">10am-4pm</span></th>
          <th>Afternoon<br><span class="tag is-small is-centered">4-8pm</span></th>
          <th>Night<br><span class="tag is-small is-centered">8pm-6am</span></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            Weekday
          </td>
          <td>{{ hws.weekday | formatHeadway('morning') }}</td>
          <td>{{ hws.weekday | formatHeadway('midday') }}</td>
          <td>{{ hws.weekday | formatHeadway('afternoon') }}</td>
          <td>{{ hws.weekday | formatHeadway('night') }}</td>
        </tr>
        <tr>
          <td>
            Saturday
          </td>
          <td>{{ hws.saturday | formatHeadway('morning') }}</td>
          <td>{{ hws.saturday | formatHeadway('midday') }}</td>
          <td>{{ hws.saturday | formatHeadway('afternoon') }}</td>
          <td>{{ hws.saturday | formatHeadway('night') }}</td>
        </tr>
        <tr>
          <td>
            Sunday
          </td>
          <td>{{ hws.sunday | formatHeadway('morning') }}</td>
          <td>{{ hws.sunday | formatHeadway('midday') }}</td>
          <td>{{ hws.sunday | formatHeadway('afternoon') }}</td>
          <td>{{ hws.sunday | formatHeadway('night') }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    headways: { type: Array, default () { return [] } }
  },
  computed: {
    hws () {
      const hwlookup = {
        1: 'weekday',
        6: 'saturday',
        7: 'sunday'
      }
      const ret = { weekday: {}, saturday: {}, sunday: {} }
      for (const hw of (this.headways || [])) {
        ret[hwlookup[hw.dow_category]] = hw
      }
      return ret
    }
  }
}
</script>
