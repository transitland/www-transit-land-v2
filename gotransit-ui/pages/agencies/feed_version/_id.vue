<template>
  <section class="section">
    <agency :ent="ent" v-if="ent" />
  </section>
</template>

<script>
import apolloProvider from '~/graphql'

export default {
  data () {
    return {
      ent: null
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    load () {
      this.$apollo
        .query({
          query: require('~/graphql/active_agencies.gql'),
          variables: {
            feed_version_sha1: this.$route.params.id
          }
        })
        .then((response) => {
          this.ent = response.data.active_agencies[0]
        })
    }
  },
  apolloProvider
}
</script>
