import Vue from 'vue'
import { formatDistanceToNow, parseISO, format } from 'date-fns'
import RouteIcon from '~/components/route-icon'

Vue.component('route-icon', RouteIcon)

Vue.filter('fromNow', function (comparisonDate) {
  return formatDistanceToNow(
    parseISO(comparisonDate + 'Z'), {
      addSuffix: true
    }
  ).replace('about ', '')
})

Vue.filter('formatHMS', function (value) {
  value = value % (24 * 3600)
  let h = Math.floor(value / 3600)
  let m = Math.floor((value % 3600) / 60)
  let s = Math.floor((value % 3600) % 60)
  let ampm = 'am'
  if (h === 0) {
    h = h + 12
  } else if (h === 12) {
    ampm = 'pm'
  } else if (h > 12) {
    h -= 12
    ampm = 'pm'
  }
  if (m < 10) { m = '0' + m }
  if (s < 10) { s = '0' + s }
  return `${h}:${m} ${ampm}`
})

Vue.filter('shortenName', function (value, len) {
  if (!len) {
    len = 24
  }
  if (value.length > len) {
    return value.substr(0, len) + '…'
  }
  return value
})

Vue.filter('formatHeadway', function (hw, tod) {
  if (!hw) {
    return ''
  }
  if (!tod) {
    tod = 'morning'
  }
  const amin = hw[`headway_seconds_${tod}_min`]
  const amid = hw[`headway_seconds_${tod}_mid`]
  const amax = hw[`headway_seconds_${tod}_max`]
  if (amin && amax) {
    if ((Math.abs(amax - amin) / amax) > 0.2) {
      return `${Math.ceil(amin / 60)} - ${Math.ceil(amax / 60)}`
    }
  }
  if (amid) {
    return `${Math.ceil(amid / 60)}`
  }
  return ''
})

Vue.filter('formatDate',
  function formatdate (value) {
    return format(parseISO(value), 'yyyy-MM-dd')
  }
)

Vue.filter('joinUnique', function (values) {
  return Array.from(new Set(values)).sort().join(', ')
})

Vue.filter('round', function (value) {
  return value.toFixed(2)
})

Vue.filter('thousands', function (value) {
  value = parseFloat(value)
  if (isNaN(value)) {
    return '-'
  }
  return Math.ceil(value).toLocaleString()
})

Vue.filter('dig', function (object, path) {
  return path.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, object)
})

Vue.filter('pct', function (value) {
  if (isNaN(parseFloat(value))) {
    return ''
  }
  return `${(value * 100).toFixed(2)} %`
})

Vue.filter('capitalize', function (value) {
  return value.split(' ').map((w) => { return w.substr(0, 1).toUpperCase() + w.substr(1, w.length - 1).toLowerCase() }).join(' ')
})

// https://gist.github.com/james2doyle/4aba55c22f084800c199
// usage: {{ file.size | prettyBytes }}
Vue.filter('prettyBytes', function (num) {
  if (typeof num !== 'number' || isNaN(num)) {
    throw new TypeError('Expected a number')
  }
  const neg = num < 0
  const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  if (neg) {
    num = -num
  }
  if (num < 1) {
    return (neg ? '-' : '') + num + ' B'
  }
  const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
  num = (num / 1000 ** exponent).toFixed(2) * 1
  const unit = units[exponent]
  return (neg ? '-' : '') + num + ' ' + unit
})
