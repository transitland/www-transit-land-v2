<template>
  <div>
    <h1 class="title">
      Transitland Operators
    </h1>

    <div class="content is-medium">
      <p>
        Transitland uses operators to group together <nuxt-link :to="{name:'data'}">
          feeds
        </nuxt-link> and other relevant data. This table can be searched and sorted; click on an operator name to drill down for more information.
      </p>
    </div>

    <b-field label="Search by operator name or location">
      <div v-if="$route.query.agency_name || $route.query.city_name || $route.query.state_name || $route.query.country_name">
        <b-tag
          size="is-medium"
          attached
          closable
          aria-close-label="Close tag"
          @close="clearQuery"
        >
          {{ $route.query.agency_name || $route.query.city_name || $route.query.state_name || $route.query.country_name }}
        </b-tag>
      </div>
      <div v-else>
        <agency-autocomplete @selected="onAutocomplete" />
      </div>
    </b-field>

    <b-table
      :data="agencies"
      :striped="true"
      :paginated="true"
      :pagination-simple="true"
      pagination-position="both"
      sort-icon="menu-up"
      :total="total"
      :current-page="currentPage"
      backend-pagination
      backend-sorting
      @sort="onSort"
      @page-change="onPageChange"
    >
      <!-- TODO: fix sorting -->
      <template slot-scope="props">
        <b-table-column field="agency_name" label="Operator Name">
          <nuxt-link :to="{name: 'operators-operator', params: {operator: props.row.operator_onestop_id}}">
            {{ props.row.agency_name }}
          </nuxt-link>
        </b-table-column>
        <b-table-column field="city_name" label="City" :width="200">
          {{ props.row.city_name }}
        </b-table-column>
        <b-table-column field="state_name" label="State/Province" :width="200">
          {{ props.row.state_name }}
        </b-table-column>
        <b-table-column field="country_name" label="Country" :width="260">
          {{ props.row.country_name }}
        </b-table-column>
      </template>
    </b-table>

    <!-- NOTE: bring this disclaimer back after adding license info columns
    <div style="font-size:10pt;margin-top:40px">
      This list is provided for informational purposes only and does not constitute legal advice. We do not guarantee the accuracy or reliability of the Feed Registry whatsoever. You are advised to consult with your own legal counsel before using and relying on the information provided in the Feed Registry.
    </div>
    -->
    <div style="margin-top:40px">
      <b-message type="is-info">
        <div>
          Know an operator that's missing? <a href="https://github.com/transitland/transitland-atlas#readme" class="button" style="float:right">Add an operator to Transitland Atlas</a>
        </div>
      </b-message>
    </div>
  </div>
</template>

<script>
import AgencyAutocomplete from '~/components/agency-autocomplete'

function query (client, vars) {
  const defaultOrderBy = [{ country_name: 'asc' }, { state_name: 'asc' }, { city_name: 'asc' }, { agency_name: 'asc' }]
  vars.limit = vars.limit ? vars.limit : 20
  vars.offset = vars.offset ? vars.offset : 0
  vars.order_by = vars.order_by ? vars.order_by : defaultOrderBy
  return client
    .query({
      query: require('~/graphql/agency-operator-merge.gql'),
      variables: vars
    })
    .then(({ data }) => {
      return data
    })
}

export default {
  components: { AgencyAutocomplete },
  watchQuery: true,
  asyncData (context) {
    const vars = {}
    const q = context.query
    vars.agency_name = q.agency_name ? `%${q.agency_name}%` : null
    vars.city_name = q.city_name ? `%${q.city_name}%` : null
    vars.state_name = q.state_name ? `%${q.state_name}%` : null
    vars.country_name = q.country_name ? `%${q.country_name}%` : null
    vars.limit = 20
    if (q.page) {
      vars.offset = (parseInt(q.page) - 1) * vars.limit
    }
    const client = context.app.apolloProvider.defaultClient
    return query(client, vars)
  },
  computed: {
    total () {
      return this.count.aggregate.count
    },
    agencies () {
      return this.entities
    },
    currentPage () {
      const page = this.$route.query.page
      if (page) {
        return parseInt(page)
      }
      return 1
    }
  },
  methods: {
    clearQuery () {
      this.$router.push({ path: 'operators', query: { } })
    },
    onAutocomplete (a, b) {
      const q = {}
      q.page = 1
      q[a] = b
      this.$router.push({ path: 'operators', query: q })
    },
    onPageChange (page) {
      const obj = Object.assign({}, this.$route.query)
      obj.page = page
      this.$router.push({ path: 'operators', query: obj })
      // this.$router.push({ path: 'operators', query: Object.assign(this.$route.query, { page }) })
    },
    onSort (field, order) {
    }
  },
  head () {
    return {
      title: 'Browse all Operators'
    }
  }
}
</script>
