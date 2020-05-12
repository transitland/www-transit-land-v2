<template>
  <div>
    <h1 class="title">
      <a href="/operators">Operators</a> / {{ operator.operator_onestop_id }}
    </h1>
    <span v-for="feedOnestopId in feedOnestopIds" :key="feedOnestopId">
      <nuxt-link :to="{name: 'feeds-feed', params: {feed: feedOnestopId}}">
        {{ feedOnestopId }}
      </nuxt-link>
    </span>
  </div>
</template>

<script>
export default {
  apollo: {
    q: {
      query: require('~/graphql/current_operator.gql'),
      variables () {
        return {
          operator_onestop_id: this.$route.params.operator
        }
      },
      update (data) {
        this.operator = data.tl_agency_operator_merge[0]
      }
    }
  },
  data () {
    return {
      operator: {}
    }
  },
  computed: {
    feedOnestopIds () {
      try {
        // TODO: make sure this can handle multiple associated feeds
        return [this.operator.agency.feed_version.current_feed.onestop_id]
      } catch {
        return []
      }
    }
  },
  head () {
    return {
      title: `${this.operator.operator_name} • operator details`
    }
  }
}
</script>
