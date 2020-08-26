<template>
  <div>
    <b-message v-if="error" class="is-danger">
      {{ error }}
    </b-message>
    <span v-else-if="$apollo.loading" class="is-loading" />
    <div v-else>
      <nav class="breadcrumb">
        <ul>
          <li>
            <nuxt-link :to="{name:'operators'}">
              Operators
            </nuxt-link>
          </li><li>
            <nuxt-link :to="{name:'operators', params:{operator:$route.params.operator_onestop_id}}">
              {{ operatorName }}
            </nuxt-link>
          </li>
        </ul>
      </nav>
      <h1 class="title">
        {{ operatorName }}
      </h1>
      <section class="content">
        <dl>
          <dt>Onestop ID</dt>
          <dd>{{ $route.params.operator }}</dd>
          <template v-if="operator.country_name">
            <dt>Country</dt>
            <dd>{{ operator.country_name }}</dd>
          </template>
          <template v-if="operator.state_name">
            <dt>State/Province</dt>
            <dd>{{ operator.state_name }}</dd>
          </template>
          <template v-if="operator.city_name">
            <dt>City</dt>
            <dd>{{ operator.city_name }}</dd>
          </template>
        </dl>
      </section>
      <b-tabs v-model="activeTab" type="is-boxed">
        <b-tab-item label="Map">
          <!-- need fvids for good index search -->
          <feed-version-map-viewer :fvids="fvids" :agency-ids="agencyIds" :overlay="true" />
        </b-tab-item>
        <b-tab-item label="Data sources">
          <b-table
            :data="agencies"
            :striped="true"
            sort-icon="menu-up"
          >
            <template slot-scope="props">
              <b-table-column field="agency" label="Source feed">
                {{ props.row.feed_version.current_feed.onestop_id }}
              </b-table-column>
              <b-table-column field="agency" label="Source agency">
                {{ props.row.agency_name }}
              </b-table-column>
            </template>
          </b-table>
        </b-tab-item>
        <b-tab-item label="Routes">
          <route-viewer v-if="activeTab === 2" :agency-ids="agencyIds" :fvids="fvids" :show-agency="true" />
        </b-tab-item>
        <b-tab-item label="Stops">
          <stop-viewer v-if="activeTab === 3" :agency-ids="agencyIds" :fvids="fvids" />
        </b-tab-item>
      </b-tabs>
    </div>
  </div>
</template>

<script>
export default {
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
    agencies () {
      const ret = []
      for (const ent of this.entities) {
        if (ent.agency) {
          ret.push(ent.agency)
        }
      }
      return ret
    },
    agencyIds () {
      return this.agencies.map((s) => { return s.id }).filter((s) => { return s })
    },
    fvids () {
      return this.agencies.map((s) => { return s.feed_version.id })
    },
    operator () {
      if (this.entities && this.entities.length > 0 && this.entities[0]) {
        return this.entities[0]
      } else {
        return null
      }
    },
    operatorName () {
      if (this.operator > 0 && this.operator.operator_name) {
        return this.operator.operator_name
      } else if (this.agencies && this.agencies.length > 0) {
        return this.agencies[0].agency_name
      } else {
        return ''
      }
    }
  },
  head () {
    return {
      title: `${this.operatorName} • operator details`
    }
  }
}
</script>
