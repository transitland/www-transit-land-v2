<template>
  <div>
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

    <b-message v-if="error" class="is-danger">
      {{ error }}
    </b-message>

    <b-table
      :data="entityPage"
      :striped="true"
      :paginated="true"
      :loading="$apollo.loading"
      sort-icon="menu-up"
      :total="total"
      :current-page.sync="page"
      backend-pagination
      backend-sorting
      backend-filtering
      @sort="onSort"
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
  </div>
</template>

<script>
import TableViewerMixin from '~/components/table-viewer-mixin'

export default {
  mixins: [TableViewerMixin],
  apollo: {
    q: {
      query: require('~/graphql/agency-operator-merge.gql'),
      error (e) { this.error = e },
      variables () {
        const vars = {
          offset: this.entityOffset,
          limit: this.limit,
          order_by: [{ country_name: 'asc' }, { state_name: 'asc' }, { city_name: 'asc' }, { agency_name: 'asc' }]
        }
        const q = this.$route.query // Object.assign({}, this.$route.query)
        vars.agency_name = q.agency_name ? `%${q.agency_name}%` : null
        vars.city_name = q.city_name ? `%${q.city_name}%` : null
        vars.state_name = q.state_name ? `%${q.state_name}%` : null
        vars.country_name = q.country_name ? `%${q.country_name}%` : null
        return vars
      },
      update (data) {
        this.entities = data.entities
        this.total = data.count.aggregate.count
      }
    }
  },
  methods: {
    clearQuery () {
      this.$router.push({ path: 'operators', query: { } })
    },
    onAutocomplete (a, b) {
      const q = {}
      q[a] = b
      this.$router.push({ path: 'operators', query: q })
      this.page = 1
    }
  }
}
</script>
