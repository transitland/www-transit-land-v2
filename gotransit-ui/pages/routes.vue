<template>
  <section class="section">
    <route :ent="ent" v-for="ent in ents" />
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
          query: require('../graphql/active_routes.gql'),
          variables: {
            agency_id: this.$route.query.agency_id
          }
        })
        .then((response) => {
          this.ents = response.data.active_routes
        })
    }
  },
  apolloProvider
}
</script>
