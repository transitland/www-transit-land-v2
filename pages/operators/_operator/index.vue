<template>
  <div>
    <b-message v-if="error" class="is-danger">
      {{ error }}
    </b-message>
    <span v-else-if="$apollo.loading" class="is-loading" />
    <div v-else>
      <h1 class="title">
        <nuxt-link :to="{name:'operators'}">
          Operators
        </nuxt-link> /
        <nuxt-link :to="{name:'operators', params:{operator:$route.params.operator}}">
          {{ $route.params.operator }}
        </nuxt-link>
      </h1>

      <b-table
        :data="associatedFeeds"
        :striped="true"
        sort-icon="menu-up"
      >
        <template slot-scope="props">
          <b-table-column label="Feed" field="feed_onestop_id">
            {{ props.row.feed_onestop_id }}
          </b-table-column>
          <b-table-column label="Agency" field="gtfs_agency_id">
            {{ props.row.gtfs_agency_id }}
          </b-table-column>
          <b-table-column label="Matched">
            {{ findAgencyMatch(props.row) }}
          </b-table-column>
        </template>
      </b-table>

      <br>

      <b-tabs v-model="activeTab" type="is-boxed">
        <b-tab-item label="Map">
          <!-- need fvids for good index search -->
          <feed-version-map-viewer :fvids="fvids" :agency-ids="agencyIds" :overlay="true" />
        </b-tab-item>
        <b-tab-item label="Routes">
          <route-viewer v-if="activeTab === 1" :agency-ids="agencyIds" :fvids="fvids" :show-agency="true" />
        </b-tab-item>
        <b-tab-item label="Stops">
          <stop-viewer v-if="activeTab === 2" :agency-ids="agencyIds" :fvids="fvids" />
        </b-tab-item>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import RouteViewer from '~/components/route-viewer'
import FeedVersionMapViewer from '~/components/feed-version-map-viewer'
import StopViewer from '~/components/stop-viewer'

export default {
  components: { FeedVersionMapViewer, RouteViewer, StopViewer },
  apollo: {
    entities: {
      error (e) { this.error = e },
      query: require('~/graphql/current-operator.gql'),
      variables () {
        return {
          operator_onestop_id: this.$route.params.operator
        }
      }
    }
  },
  data () {
    return {
      activeTab: 0,
      entities: [],
      error: null
    }
  },
  computed: {
    entity () {
      return this.entities.length > 0 ? this.entities[0] : null
    },
    agencies () {
      const ret = []
      for (const ent of this.entities) {
        if (ent.agency) {
          ret.push(ent.agency)
        }
      }
      return ret
    },
    associatedFeeds () {
      const ret = []
      for (const a of this.entity.associated_feeds || []) {
        ret.push(a)
      }
      return ret
    },
    agencyIds () {
      return this.agencies.map((s) => { return s.id }).filter((s) => { return s })
    },
    fvids () {
      return this.agencies.map((s) => { return s.feed_version.id }).filter((s) => { return s })
    }
  },
  methods: {
    findAgencyMatch (assoc) {
      for (const a of this.agencies) {
        console.log(a, assoc)
        if (a.feed_version.current_feed.onestop_id === assoc.feed_onestop_id && a.agency_id === assoc.gtfs_agency_id) {
          return 'Yes'
        }
      }
      return null
    }
  },
  head () {
    return {
      title: ' • operator details'
    }
  }
}
</script>
