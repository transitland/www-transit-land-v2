<template>
  <div>
    <div v-for="entity of entities" :key="entity.id">
      Entity: {{ entity }}
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'

const query = gql`
query($onestop_id:String!) {
  entities: tl_mv_active_stops(limit: 100, where: {onestop_id: {_eq: $onestop_id}}) {
    id
    stop_id
    stop_name
  }
}

`

export default {
  data () {
    return {
      entities: []
    }
  },
  apollo: {
    entities: {
      query,
      variables () {
        return {
          onestop_id: this.$route.params.onestop_id
        }
      }
    }
  },
  computed: {
    features () {
      const ret = []
      return ret
    }
  }
}
</script>
