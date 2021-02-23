<template>
  <div class="container">
    <h1 class="title">
      Transitland Operators
    </h1>

    <div class="content is-medium">
      <p>
        Transitland uses operators to group together <nuxt-link :to="{name:'feeds'}">
          source feeds
        </nuxt-link> and other relevant data. This table can be searched and sorted; click on an operator name to drill down for more information.
      </p>
    </div>

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
          <div v-else style="width:100%">
            <search-bar v-model="search" placeholder="e.g. Bay Area Rapid Transit" />
          </div>

          <b-dropdown class="is-pulled-right" append-to-body aria-role="menu" trap-focus>
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
        :loading="$apollo.loading"
      >
        <!-- TODO: fix sorting -->
        <b-table-column v-slot="props" field="name" label="Operator Name (Short Name)">
          <nuxt-link :to="{name: 'operators-onestop_id', params: {onestop_id: props.row.onestop_id}}">
            {{ props.row.name }}
          </nuxt-link>
          <span v-if="props.row.short_name">({{ props.row.short_name }})</span>
        </b-table-column>
        <b-table-column v-slot="props" field="city_name" label="City" :width="200">
          {{ props.row.city_name }}
        </b-table-column>
        <b-table-column v-slot="props" field="adm1name" label="State/Province" :width="200">
          {{ props.row.adm1name }}
        </b-table-column>
        <b-table-column v-slot="props" field="adm0name" label="Country" :width="260">
          <b-tooltip :label="props.row.other_places.filter((s)=>{return s.name}).map((s)=>{return s.name}).join(', ')" dashed>
            {{ props.row.adm0name }}
          </b-tooltip>
        </b-table-column>
      </b-table>
      <show-more v-if="entities.length === limit || hasMore" :limit="entities.length" @click="showAll" />
    </div>

    <div>
      <b-message type="is-info">
        <div>
          Know an operator that's missing? <a href="https://github.com/transitland/transitland-atlas/blob/master/README.md#how-to-add-a-new-feed" class="button" style="float:right">Add an operator to Transitland Atlas</a>
        </div>
      </b-message>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import TableViewerMixin from '~/components/table-viewer-mixin'

const q = gql`
query ($limit: Int, $after: Int, $search: String, $merged: Boolean) {
  entities: operators(after: $after, limit: $limit, where: {search: $search, merged:$merged}) {
    id
    agency_name
    operator_name
    operator_short_name
    onestop_id
    city_name
    adm1name
    adm0name
    places_cache
    agency {
      places(where:{min_rank:0.2}) {
        name
        adm0name
        adm1name
      }
    }
  }
}
`

export default {
  mixins: [TableViewerMixin],
  data () {
    return {
      search: '',
      merged: false,
      unmatched: true
    }
  },
  apollo: {
    entities: {
      query: q,
      error (e) { this.error = e },
      variables () {
        return {
          search: this.search,
          merged: this.merged,
          limit: this.limit
        }
      }
    }
  },
  computed: {
    entityPageFlat () {
      return this.entityPage.map((s) => {
        return {
          name: (this.merged ? s.operator_name : s.agency_name) || s.agency_name || s.operator_name,
          short_name: s.operator_short_name,
          agency: s.agency,
          operator: s.operator,
          best_place: [], // s.agency.places.length > 0 ? s.agency.places[0] : {},
          other_places: (s.agency || {}).places || [],
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
  },
  head () {
    return {
      title: 'Browse all Operators',
      meta: [
        { hid: 'description', name: 'description', content: 'Transitland uses operators to group together source feeds and other relevant data.' }
      ]
    }
  }
}
</script>
