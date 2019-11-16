<template>
  <section class="section">
    <agency :ent="ent" v-for="ent in ents" />
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
          query: require('../graphql/active_agencies.gql'),
          variables: {}
        })
        .then((response) => {
          this.ents = response.data.active_agencies
        })
    }
  },
  apolloProvider
}
</script>

<style scoped>
</style>
