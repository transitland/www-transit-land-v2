<template>
  <div>
    <div :key="agency" v-for="(routes,agency) in agencyFeatures">
      <strong>{{ agency }} </strong>
      <template v-if="routeCount > 5 && collapse">
        <div>{{ Object.keys(routes).length }} routes</div>
      </template>
      <template v-else>
        <div v-for="route in routes" :key="route.id">
          <nuxt-link
            :to="{name: 'feeds-feed-version-routes-route', params:{feed:route.onestop_id,version:'latest',route:route.route_id}}"
          >
            <route-icon
              :key="route.id"
              :routeType="route.route_type"
              :routeShortName="route.route_short_name"
              :routeLongName="route.route_long_name"
            />
          </nuxt-link>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    collapse: { type: Boolean },
    agencyFeatures: { type: Object, default () { return {} } }
  },
  computed: {
    routeCount () {
      let count = 0
      for (const v of Object.values(this.agencyFeatures)) {
        count = count + Object.keys(v).length
      }
      return count
    }
  }
}
</script>
