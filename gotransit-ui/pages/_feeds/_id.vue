<template>
  <section class="section">
    <feed :ent="ent" v-if="ent" />
  </section>
</template>

<script>
import apolloProvider from '~/graphql'

export default {
  layout: 'map',
  data () {
    return {
      ent: null
    }
  },
  mounted () {
    this.load()
  },
  validate ({ params }) {
    if (!params.id || params.id.length === 0) {
      return false
    }
    return true
  },
  methods: {
    load () {
      this.$apollo
        .query({
          query: require('~/graphql/current_feed.gql'),
          variables: {
            onestop_id: this.$route.params.id
          }
        })
        .then((response) => {
          this.ent = response.data.current_feeds[0]
        })
    }
  },
  apolloProvider
}
</script>

<style scoped>
</style>
