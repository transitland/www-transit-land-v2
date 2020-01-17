import Vue from 'vue'
import VueAffix from 'vue-affix'
import agencyComponent from '../components/agency.vue'
import routeComponent from '../components/route.vue'
import feedComponent from '../components/feed.vue'

Vue.component('agency', agencyComponent)
Vue.component('route', routeComponent)
Vue.component('feed', feedComponent)

Vue.use(require('vue-moment'))

Vue.use(VueAffix)

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
