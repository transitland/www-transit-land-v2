<template>
  <div>
    <b-field grouped>
      <b-field label="Search by operator name or location" expanded>
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
      <b-field label="‎">
        <!-- the label is a zero width space! -->
        <b-dropdown position="is-bottom-left" append-to-body aria-role="menu" trap-focus>
          <a
            slot="trigger"
            class="navbar-item"
            role="button"
          >
            <span>Options</span>
            <b-icon icon="menu-down" />
          </a>

          <b-dropdown-item
            aria-role="menu-item"
            :focusable="false"
            custom
            paddingless
          >
            <div class="modal-card" style="width:300px;">
              <section class="modal-card-body">
                <div class="field">
                  <b-checkbox v-model="distinctOn" true-value="operator_onestop_id" false-value="id">
                    Group by operator
                  </b-checkbox>
                </div>

                <div class="field">
                  <b-checkbox>
                    Include unmatched operators
                  </b-checkbox>
                </div>
              </section>
            </div>
          </b-dropdown-item>
        </b-dropdown>
      </b-field>
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
      <b-table-column v-slot="props" field="name" label="Operator Name">
        <nuxt-link :to="{name: 'operators-operator', params: {operator: props.row.operator_onestop_id}}">
          {{ props.row.name }}
        </nuxt-link>
      </b-table-column>
      <b-table-column v-slot="props" field="city_name" label="City" :width="200">
        {{ props.row.city_name }}
      </b-table-column>
      <b-table-column v-slot="props" field="adm1name" label="State/Province" :width="200">
        {{ props.row.adm1name }}
      </b-table-column>
      <b-table-column v-slot="props" field="adm0name" label="Country" :width="260">
        <b-tooltip :label="props.row.other_places.join(',')" dashed>
          {{ props.row.adm0name }}
        </b-tooltip>
      </b-table-column>
    </b-table>
  </div>
</template>

<script>
import TableViewerMixin from '~/components/table-viewer-mixin'

export default {
  mixins: [TableViewerMixin],
  data () {
    return {
      distinctOn: 'operator_onestop_id',
      filterOperators: 'yes'
    }
  },
  apollo: {
    q: {
      query () { return this.distinctOn === 'operator_onestop_id' ? require('~/graphql/agency-operator-merge.gql') : require('~/graphql/agency-operator.gql') },
      error (e) { this.error = e },
      variables () {
        return {
          offset: this.entityOffset,
          limit: this.limit,
          name: this.$route.query.name,
          city_name: this.$route.query.city_name,
          adm1name: this.$route.query.adm1name,
          adm0name: this.$route.query.adm0name,
          order_by: this.distinctOn === 'operator_onestop_id' ? { operator_name: 'asc' } : { agency_name: 'asc' }
        }
      },
      update (data) {
        this.entities = data.entities
        this.total = data.total.aggregate.count
      }
    }
  },
  computed: {
    entityPageFlat () {
      return this.entityPage.map((s) => {
        return {
          name: this.distinctOn === 'operator_onestop_id' ? s.operator_name : s.agency_name,
          operator: s.operator,
          best_place: [], // s.agency.places.length > 0 ? s.agency.places[0] : {},
          other_places: [], // s.agency.places || [],
          operator_onestop_id: s.operator_onestop_id,
          city_name: s.city_name,
          adm1name: s.adm1name,
          adm0name: s.adm0name
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
