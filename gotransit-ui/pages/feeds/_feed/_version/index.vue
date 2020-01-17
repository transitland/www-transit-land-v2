<template>
  <section class="section">
    Feed Version {{ $route.params }}
  </section>
</template>

<script>
import apolloProvider from '~/graphql'

export default {
  props: [],
  data () {
  },
  apollo: {
    current_feeds: {
      query: require('~/graphql/current_feed.gql'),
      prefetch: ({ route }) => ({ id: route.params.id }),
      variables () {
        return {
          onestop_id: this.$route.params.feed
        }
      }
    }
  },
  apolloProvider
}
</script>

<style scoped>
</style>
