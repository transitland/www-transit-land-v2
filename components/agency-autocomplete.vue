<template>
  <section>
    <p class="content">
      <b>Selected:</b>
      {{ selected }}
      <b>Key:</b> {{ key }}
    </p>
    <b-field label="Search by agency name or location">
      <b-autocomplete
        :data="data"
        placeholder="e.g. Bay Area Rapid Transit"
        field="title"
        :loading="isFetching"
        @typing="getAsyncData"
        @select="option => selected = option"
      >
        <template slot-scope="props">
          {{ props.option.name }}
          <span v-if="props.option.city" style="padding-left:30px;color:#ccc">{{ props.option.city }}</span>
          <span v-if="props.option.state" style="padding-left:30px;color:#ccc">{{ props.option.state }}</span>
          <span v-if="props.option.country" style="padding-left:30px;color:#ccc">{{ props.option.country }}</span>
          </span>
          <span style="float:right;color:#ccc">{{ props.option.type }}</span>
        </template>
      </b-autocomplete>
    </b-field>
  </section>
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
  computed: {
    key () {
      return this.selected ? this.selected.key : null
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
            ret.push({ type: 'Agency', key: 'agency_name', name: i.agency_name })
          }
          for (const i of data.city_names) {
            ret.push({ type: 'City', key: 'city_name', name: i.name, state: i.adm1name, country: i.adm0name })
          }
          for (const i of data.admin_names) {
            ret.push({ type: 'State/Province', key: 'state_name', name: i.adm1name, country: i.adm0name })
          }
          for (const i of data.country_names) {
            ret.push({ type: 'Country', key: 'country_name', name: i.adm0name })
          }
          this.data = ret
          this.isFetching = false
        })
    }, 100)
  }
}
</script>
