<template>
  <div>
    <b-field label="Search by operator name or location">
      <div v-if="$route.query.name || $route.query.city_name || $route.query.adm1name || $route.query.adm0name">
        <b-tag
          size="is-medium"
          attached
          closable
          aria-close-label="Close tag"
          @close="clearQuery"
        >
          {{ $route.query.name || $route.query.city_name || $route.query.adm1name || $route.query.adm0name }}
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
      :data="entityPageFlat"
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
        <b-table-column field="name" label="Operator Name">
          <nuxt-link :to="{name: 'operators-operator', params: {operator: props.row.operator_onestop_id}}">
            {{ props.row.name }}
          </nuxt-link>
        </b-table-column>
        <b-table-column field="best_place.city_name" label="City" :width="200">
          {{ props.row.best_place.city_name }}
        </b-table-column>
        <b-table-column field="best_place.adm1name" label="State/Province" :width="200">
          {{ props.row.best_place.adm1name }}
        </b-table-column>
        <b-table-column field="country_name" label="Country" :width="260">
          <b-tooltip :label="props.row.other_places.join(',')" dashed>
            {{ props.row.best_place.adm0name }}
          </b-tooltip>
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
        return {
          offset: this.entityOffset,
          limit: this.limit,
          name: this.$route.query.name,
          city_name: this.$route.query.city_name,
          adm1name: this.$route.query.adm1name,
          adm0name: this.$route.query.adm0name
          // order_by: [{ country_name: 'asc' }, { state_name: 'asc' }, { city_name: 'asc' }, { agency_name: 'asc' }]
        }
      },
      update (data) {
        this.entities = data.entities
        this.total = 1000 // data.count.aggregate.count
      }
    }
  },
  computed: {
    entityPageFlat () {
      return this.entityPage.map((s) => {
        return {
          name: s.agency.agency_name,
          best_place: s.agency.places.length > 0 ? s.agency.places[0] : {},
          other_places: s.agency.places || []
        }
      })
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
