<template>
  <div>
    <h1 class="title">
      Feed Registry
    </h1>

    <div>The Feed Registry lists all the transit operators and feeds included in Transitland. Click through to get more details about feeds associated with each operator.</div>

    <br><br>

    <b-field label="Search by agency name or location">
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
      pagination-position="top"
      sort-icon="menu-up"
      :total="total"
      :current-page="currentPage"
      backend-pagination
      backend-sorting
      @sort="onSort"
      @page-change="onPageChange"
    >
      <template slot-scope="props">
        <b-table-column field="agency_name" label="Agency Name">
          {{ props.row.agency_name }}
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

    <div style="margin-top:40px">
      <b-message type="is-info">
        <div>
          Know a feed that's missing? <a href="https://github.com/transitland/transitland-atlas#readme" class="button" style="float:right">Add a feed</a>
        </div>
      </b-message>

      <b-message type="is-info" has-icon>
        December 2019 update: Feed Registry's "add a feed" function has been deprecated. This is part of the larger effort to migrate to <a href="https://transit.land/news/2019/10/17/tlv2.html">Transitland v2</a>. The Feed Registry is now powered by Distributed Mobility Feed Registry files in the Transitland Atlas. <a href="https://github.com/transitland/transitland-atlas#readme">Transitland Atlas</a> is open to edits and additions from all on GitHub.
      </b-message>
    </div>

    <div style="font-size:10pt;margin-top:40px">
      This list is provided for informational purposes only and does not constitute legal advice. We do not guarantee the accuracy or reliability of the Feed Registry whatsoever. You are advised to consult with your own legal counsel before using and relying on the information provided in the Feed Registry.
    </div>
  </div>
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
      this.$router.push({ path: 'agencies', query: { } })
    },
    onAutocomplete (a, b) {
      const q = {}
      q.page = 1
      q[a] = b
      this.$router.push({ path: 'agencies', query: q })
    },
    onPageChange (page) {
      const obj = Object.assign({}, this.$route.query)
      obj.page = page
      this.$router.push({ path: 'agencies', query: obj })
      // this.$router.push({ path: 'agencies', query: Object.assign(this.$route.query, { page }) })
    },
    onSort (field, order) {
    }
  }
}
</script>
