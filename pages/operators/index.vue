<template>
  <div class="container">
    <h1 class="title">
      Transitland Operators
    </h1>

    <div class="content is-medium">
      <p>
        Transitland uses operators to group together
        <nuxt-link :to="{ name: 'feeds' }">
          source feeds
        </nuxt-link> and other
        relevant data. This table can be searched and sorted; click on an
        operator name to drill down for more information.
      </p>
    </div>

    <div>
      <b-field grouped>
        <b-field label="Search by operator name or location" expanded>
          <b-field
            v-if="
              $route.query.name ||
                $route.query.city_name ||
                $route.query.adm1name ||
                $route.query.adm0name
            "
            expanded
          >
            <b-tag
              size="is-medium"
              attached
              closable
              aria-close-label="Close tag"
              @close="clearQuery"
            >
              {{
                $route.query.name ||
                  $route.query.city_name ||
                  $route.query.adm1name ||
                  $route.query.adm0name
              }}
            </b-tag>
          </b-field>
          <template v-else>
            <agency-autocomplete @selected="onAutocomplete" />
          </template>

          <b-dropdown
            position="is-bottom-left"
            class="is-pulled-right"
            append-to-body
            aria-role="menu"
            trap-focus
          >
            <a slot="trigger" class="navbar-item" role="button">
              <span>Options</span>
              <b-icon icon="menu-down" />
            </a>

            <b-dropdown-item
              aria-role="menu-item"
              :focusable="false"
              custom
              paddingless
            >
              <div class="modal-card" style="width: 400px">
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

      testest:
      <b-table :data="entityPageFlat" :columns="columns" />

      entities?
      <div v-for="ent of entityPageFlat" :key="ent.id">
        {{ ent }}
      </div>
      z
      <b-table
        :data="data"
        :columns="columns"
      >
        <!-- TODO: fix sorting -->
        <b-table-column
          v-slot="props"
          field="name"
          label="name"
          :width="200"
        >
          {{ props.row.name }}
        </b-table-column>
      </b-table>
      end table
    </div>

    <div>
      <b-message type="is-info">
        <div>
          Know an operator that's missing?
          <a
            href="https://github.com/transitland/transitland-atlas/blob/master/README.md#how-to-add-a-new-feed"
            class="button"
            style="float: right"
          >Add an operator to Transitland Atlas</a>
        </div>
      </b-message>
    </div>
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
      filterOperators: 'yes',
      data: [
        { id: 1, name: 'Jesse', last_name: 'Simmons', date: '2016-10-15 13:43:27', gender: 'Male' },
        { id: 2, name: 'John', last_name: 'Jacobs', date: '2016-12-15 06:00:53', gender: 'Male' },
        { id: 3, name: 'Tina', last_name: 'Gilbert', date: '2016-04-26 06:26:28', gender: 'Female' },
        { id: 4, name: 'Clarence', last_name: 'Flores', date: '2016-04-10 10:28:46', gender: 'Male' },
        { id: 5, name: 'Anne', last_name: 'Lee', date: '2016-12-06 14:38:38', gender: 'Female' }
      ],
      columns: [
        {
          field: 'name',
          label: 'name'
        }
      ]
    }
  },
  apollo: {
    q: {
      query: require('~/graphql/agency-operators.gql'),
      error (e) {
        this.error = e
      },
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
          name:
            (this.merged ? s.operator_name : s.agency_name) ||
            s.agency_name ||
            s.operator_name,
          short_name: s.operator_short_name,
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
      this.$router.push({ name: 'operators', query: {} })
    },
    onAutocomplete (a, b) {
      const q = {}
      q[a] = b
      this.$router.push({ name: 'operators', query: q })
      this.page = 1
    }
  },
  head () {
    return {
      title: 'Browse all Operators',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content:
            'Transitland uses operators to group together source feeds and other relevant data.'
        }
      ]
    }
  }
}
</script>
