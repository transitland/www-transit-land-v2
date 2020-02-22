<template>
  <div>
    <h1 class="title">
      <a href="/operators">Operators</a> / {{ operator.operator_onestop_id }}
    </h1>
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
        this.operator = data.agency_operator_merge[0]
      }
    }
  },
  data () {
    return {
      operator: {}
    }
  },
  head () {
    return {
      title: `${this.operator.operator_name} • operator details`
    }
  }
}
</script>
