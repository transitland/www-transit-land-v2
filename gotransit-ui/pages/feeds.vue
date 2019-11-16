<template>
  <section class="section">
    <feed :ent="ent" class="entity-box" v-for="ent in ents" />
  </section>
</template>

<script>
import apolloProvider from '../graphql'

export default {
  data () {
    return {
      ents: []
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    load () {
      this.$apollo
        .query({
          query: require('../graphql/current_feeds.gql'),
          variables: {}
        })
        .then((response) => {
          this.ents = response.data.current_feeds
        })
    }
  },
  apolloProvider
}
</script>

<style scoped>
</style>
