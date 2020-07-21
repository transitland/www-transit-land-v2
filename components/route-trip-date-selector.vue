<template>
  <div>
    <b-datepicker
      v-model="dateValue"
      :events="serviceDates"
      :nearby-month-days="false"
      :focusable="false"
      size="is-small"
      indicators="bars"
      inline
    />
  </div>
</template>

<script>
import gql from 'graphql-tag'
import moment from 'moment'

const q = gql`
query ($route_id: bigint!) {
  entity: gtfs_routes_by_pk(id: $route_id) {
    id
    trips(distinct_on: service_id) {
      calendar {
        id
        service_id
        friday
        monday
        saturday
        wednesday
        thursday
        tuesday
        start_date
        sunday
        end_date
        calendar_dates {
          date
          exception_type
        }
      }
    }
  }
}
`

function dateSplit (value) {
  const a = value.split('-').map((i) => { return parseInt(i) })
  return [a[0], a[1] - 1, a[2]]
}

export default {
  props: {
    value: { type: String, default () { return moment().format('YYYY-MM-DD') } },
    routeId: { type: Number, default () { return null } }
  },
  apollo: {
    entity: {
      query: q,
      variables () {
        return { route_id: this.routeId }
      }
    }
  },
  data () {
    return {
      entity: null
    }
  },
  computed: {
    dateValue: {
      get () {
        return moment(this.value).toDate()
      },
      set (value) {
        this.$emit('input', moment(value).format('YYYY-MM-DD'))
      }
    },
    serviceDates () {
      if (!this.entity) { return [] }
      const serviceDates = new Set()
      for (const tc of (this.entity.trips || [])) {
        const cal = tc.calendar
        const calDates = new Set()
        let start = new Date(...dateSplit(cal.start_date))
        const end = new Date(...dateSplit(cal.end_date))
        while (start <= end) {
          const dow = start.getDay()
          let add = false
          if (dow === 0 && cal.sunday) {
            add = true
          } else if (dow === 1 && cal.monday) {
            add = true
          } else if (dow === 2 && cal.tuesday) {
            add = true
          } else if (dow === 3 && cal.wednesday) {
            add = true
          } else if (dow === 4 && cal.thursday) {
            add = true
          } else if (dow === 5 && cal.friday) {
            add = true
          } else if (dow === 6 && cal.saturday) {
            add = true
          }
          if (add === true) {
            calDates.add(start.toISOString().substr(0, 10))
          }
          const newDate = start.setDate(start.getDate() + 1)
          start = new Date(newDate)
        }
        for (const cd of tc.calendar.calendar_dates) {
          if (cd.exception_type === 1) {
            calDates.add(cd.date)
          } else if (cd.exception_type === 2) {
            calDates.delete(cd.date)
          }
        }
        for (const d of calDates) {
          serviceDates.add(d)
        }
      }
      return Array.from(serviceDates).map((d) => { return new Date(...dateSplit(d)) })
    }
  }
}
</script>
