<template>
  <b-autocomplete
    :data="data"
    placeholder="e.g. Bay Area Rapid Transit"
    field="title"
    :loading="isFetching"
    expanded
    @typing="getAsyncData"
    @select="option => selected = option"
  >
    <template slot-scope="props">
      {{ props.option.name }}
      <span v-if="props.option.city_name" style="padding-left:30px;color:#ccc">{{ props.option.city_name }}</span>
      <span v-if="props.option.adm1name" style="padding-left:30px;color:#ccc">{{ props.option.adm1name }}</span>
      <span v-if="props.option.adm0name" style="padding-left:30px;color:#ccc">{{ props.option.adm0name }}</span>
      <span style="float:right;color:#ccc">{{ props.option.type }}</span>
    </template>
  </b-autocomplete>
</template>

<script>
import debounce from 'lodash/debounce'
export default {
  data () {
    return {
      data: [],
      selected: null,
      isFetching: false
    }
  },
  watch: {
    selected () {
      const key = this.selected ? this.selected.key : null
      if (!key) {
        return
      }
      this.$emit('selected', this.selected.key, this.selected.name)
    }
  },
  methods: {
    getAsyncData: debounce(function (name) {
      if (!name.length) {
        this.data = []
        return
      }
      this.isFetching = true
      const client = this.$apollo.getClient()
      return client
        .query({
          query: require('~/graphql/active-agencies-autocomplete.gql'),
          variables: {
            query: `%${name}%`
          }
        })
        .then(({ data }) => {
          const ret = []
          for (const i of data.agency_names) {
            ret.push({ type: 'Agency', key: 'name', name: i.agency_name })
          }
          for (const i of data.city_names) {
            ret.push({ type: 'City', key: 'city_name', name: i.name, state: i.adm1name, country: i.adm0name })
          }
          for (const i of data.state_names) {
            ret.push({ type: 'State/Province', key: 'adm1name', name: i.adm1name, country: i.adm0name })
          }
          for (const i of data.country_names) {
            ret.push({ type: 'Country', key: 'adm0name', name: i.adm0name })
          }
          this.data = ret
          this.isFetching = false
        })
    }, 100)
  }
}
</script>
