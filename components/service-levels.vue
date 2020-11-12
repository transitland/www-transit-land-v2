<template>
  <div>
    <div class="clearfix">
      <div v-for="sl of serviceMap" :key="sl.id">
        <div class="col">
          <span class="cell month" :title="sl.start_date">{{ formatMonth(sl.start_date) }}</span>
          <span class="cell" :style="cmap(sl.monday)"><span class="tt">{{ formatDay(sl.start_date, 0) }}<br>{{ formatTooltip(sl.monday) }}</span></span>
          <span class="cell" :style="cmap(sl.tuesday)"><span class="tt">{{ formatDay(sl.start_date, 1) }}<br>{{ formatTooltip(sl.tuesday) }}</span></span>
          <span class="cell" :style="cmap(sl.wednesday)"><span class="tt">{{ formatDay(sl.start_date, 2) }}<br>{{ formatTooltip(sl.wednesday) }}</span></span>
          <span class="cell" :style="cmap(sl.thursday)"><span class="tt">{{ formatDay(sl.start_date, 3) }}<br>{{ formatTooltip(sl.thursday) }}</span></span>
          <span class="cell" :style="cmap(sl.friday)"><span class="tt">{{ formatDay(sl.start_date, 4) }}<br>{{ formatTooltip(sl.friday) }}</span></span>
          <span class="cell" :style="cmap(sl.saturday)"><span class="tt">{{ formatDay(sl.start_date, 5) }}<br>{{ formatTooltip(sl.saturday) }}</span></span>
          <span class="cell" :style="cmap(sl.sunday)"><span class="tt">{{ formatDay(sl.start_date, 6) }}<br>{{ formatTooltip(sl.sunday) }}</span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { parseISO, format, add, isBefore } from 'date-fns'

export default {
  props: {
    fvid: { type: Number, default () { return 0 } }
  },
  data () {
    return {
      feed_version_service_levels: []
    }
  },
  apollo: {
    feed_version_service_levels: {
      query: require('~/graphql/feed-version-service-levels.gql'),
      variables () {
        return {
          feed_version_id: this.fvid
        }
      },
      error (e) { this.error = e }
    }
  },
  computed: {
    serviceMap () {
      const x = this.feed_version_service_levels.slice().sort(function (a, b) {
        return a.start_date < b.start_date
      })
      const x2 = []
      for (const sl of x) {
        let startDate = parseISO(sl.start_date)
        const endDate = parseISO(sl.end_date)
        while (isBefore(startDate, endDate)) {
          x2.push(Object.assign({}, sl, { id: (x2.length * -1), start_date: format(startDate, 'yyyy-MM-dd') }))
          startDate = add(startDate, { days: 7 })
        }
      }
      return x2
    },
    maxService () {
      let m = 1
      for (const sl of this.feed_version_service_levels) {
        const b = Math.max(sl.monday, sl.tuesday, sl.wednesday, sl.thursday, sl.friday, sl.saturday, sl.sunday)
        if (b > m) { m = b }
      }
      return parseFloat(m)
    }
  },
  methods: {
    formatDay (start, offset) {
      const d = parseISO(start)
      return format(add(d, { days: offset }), 'PPPP')
    },
    formatTooltip (v) {
      return `
      ${Math.ceil(v / 3600)} service hours
      ${Math.ceil((v) * 100 / this.maxService)}% of max
      `
    },
    formatMonth (v) {
      const s = v.split('-')
      const t = parseInt(s[1])
      const d = parseInt(s[2])
      if (d > 7) {
        return ''
      }
      if (t === 1) {
        return s[0] + ' ' + months[t]
      }
      return months[t]
    },
    cmap (v) {
      const c = Math.floor((1 - (v / this.maxService)) * 50) + 50
      return {
        'background-color': 'hsl(215,100%,' + c + '%)'
      }
    }
  }
}
const months = {
  1: 'Jan',
  2: 'Feb',
  3: 'Mar',
  4: 'Apr',
  5: 'May',
  6: 'Jun',
  7: 'Jul',
  8: 'Aug',
  9: 'Sep',
  10: 'Oct',
  11: 'Nov',
  12: 'Dec'
}

</script>

<style scoped>
.col {
    position:relative;
    width: 20px;
    float: left;
    padding-bottom:20px;
}
.cell {
    display:block;
    width:20px;
    height:20px;
    border:solid 1px #fff;
}
.cell:hover {
    border:solid 1px #ff0000;
}
.month {
    width:100px;
    font-size:10pt;
    border:none;
}

.col .tt {
  visibility: hidden;
  width: 280px;
  background-color: black;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px;

  /* Position the tooltip */
  position: absolute;
  z-index: 1;
  top: -60px;
  left: 0%;
}

.col span:hover .tt {
  visibility: visible;
}

</style>
