<template>
  <div>
    <b-field grouped>
      <b-field label="Search by operator name or location" expanded>
        <b-field v-if="$route.query.name || $route.query.city_name || $route.query.adm1name || $route.query.adm0name" expanded>
          <b-tag
            size="is-medium"
            attached
            closable
            aria-close-label="Close tag"
            @close="clearQuery"
          >
            {{ $route.query.name || $route.query.city_name || $route.query.adm1name || $route.query.adm0name }}
          </b-tag>
        </b-field>
        <template v-else>
          <agency-autocomplete @selected="onAutocomplete" />
        </template>

        <b-dropdown position="is-bottom-left" class="is-pulled-right" append-to-body aria-role="menu" trap-focus>
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
            <div class="modal-card" style="width:400px;">
              <section class="modal-card-body">
                <div class="field">
                  <b-checkbox v-model="merged">
                    Group agencies by operator
                  </b-checkbox>
                </div>

                <div class="field">
                  <b-checkbox v-model="unmatched">
                    Show operators without agency matches
                  </b-checkbox>
                </div>
              </section>
            </div>
          </b-dropdown-item>
        </b-dropdown>
      </b-field>
    </b-field>

    <b-table
      :data="entityPageFlat"
      :striped="true"
      :paginated="true"
      :loading="$apollo.loading"
      sort-icon="menu-up"
      :total="total"
      backend-pagination
      @page-change="onPageChange"
      @sort="onSort"
    >
      <!-- TODO: fix sorting -->
      <b-table-column v-slot="props" field="name" label="Operator Name">
        <nuxt-link :to="{name: 'operators-onestop_id', params: {onestop_id: props.row.onestop_id}}">
          {{ props.row.name }}
        </nuxt-link>
        <!-- TODO: expose operator short name <span v-if="props.row.short_name">({{ props.row.short_name }})</span> -->
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
      merged: true,
      unmatched: false,
      filterOperators: 'yes'
    }
  },
  apollo: {
    q: {
      query: require('~/graphql/agency-operators.gql'),
      error (e) { this.error = e },
      variables () {
        return {
          merged: this.merged,
          unmerged: !this.merged,
          unmatched: this.unmatched,
          offset: this.entityOffset,
          limit: this.limit,
          name: this.$route.query.name,
          city_name: this.$route.query.city_name,
          adm1name: this.$route.query.adm1name,
          adm0name: this.$route.query.adm0name
        }
      },
      update (data) {
        if (this.unmatched) {
          this.entities = data.unmatched_entities
          this.total = data.unmatched_total.aggregate.count
        } else {
          this.entities = data.entities
          this.total = data.total.aggregate.count
        }
      }
    }
  },
  computed: {
    entityPageFlat () {
      return this.entityPage.map((s) => {
        return {
          name: (this.merged ? s.operator_name : s.agency_name) || s.agency_name || s.operator_name,
          agency: s.agency,
          operator: s.operator,
          best_place: [], // s.agency.places.length > 0 ? s.agency.places[0] : {},
          other_places: [], // s.agency.places || [],
          onestop_id: s.onestop_id,
          city_name: s.city_name,
          adm1name: s.adm1name,
          adm0name: s.adm0name
        }
      })
    }
  },
  methods: {
    clearQuery () {
      this.$router.push({ name: 'operators', query: { } })
    },
    onAutocomplete (a, b) {
      const q = {}
      q[a] = b
      this.$router.push({ name: 'operators', query: q })
      this.page = 1
    }
  }
}
</script>
