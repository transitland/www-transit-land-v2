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
