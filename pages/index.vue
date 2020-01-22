<template>
  <section class="section" />
</template>

<script>
export default {
  computed: {
    feed () {
      return this.current_feeds[0]
    }
  },
  asyncData (context) {
    const client = context.app.apolloProvider.defaultClient
    return client.query({
      query: require('~/graphql/current_feed.gql')
    }).then(({ data }) => {
      return data
    })
  }

}
</script>
