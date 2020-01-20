<template>
  <section class="section">
    <div v-for="route in feed.feed_state.feed_version.routes" :key="route.id">
      <nuxt-link
        :to="{name: 'feeds-feed-version-routes-route', params:{feed:$route.params.feed, version:$route.params.version,route:route.route_id}}"
      >
        <route-icon
          :routeType="route.route_type"
          :routeShortName="route.route_short_name"
          :routeLongName="route.route_long_name"
        />
      </nuxt-link>
    </div>
  </section>
</template>

<script>
export default {
  props: [],
  computed: {
    feed () {
      return this.current_feeds[0]
    }
  },
  asyncData (context) {
    const client = context.app.apolloProvider.defaultClient
    return client.query({
      query: require('~/graphql/current_feed.gql'),
      variables: {
        onestop_id: context.route.params.feed
      }
    }).then(({ data }) => {
      return data
    })
  }
}
</script>
