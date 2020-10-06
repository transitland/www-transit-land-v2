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
      <table class="property-list">
        <tr>
          <td>
            <b-tooltip dashed label="A unique identifier for this operator">
              Operator ID
            </b-tooltip>
          </td>
          <td>
            <nuxt-link :to="{name:'operators-operator', params:{operator:$route.params.operator}}">
              {{ onestopId }}
            </nuxt-link>
            <template v-if="generatedOperator">
              <b-tooltip label="Create a new Operator metadata file in Transitland Atlas">
                <a :href="newLink" target="_blank"><b-icon size="is-small" icon="help-circle-outline" /></a>
              </b-tooltip>
            </template>
            <template v-else>
              <b-tooltip dashed label="Edit this Operator and associated metadata in Transitland Atlas">
                <a :href="editLink" target="_blank"><b-icon icon="pencil" size="is-small" /></a>
              </b-tooltip>
            </template>
          </td>
        </tr>
        <tr>
          <td>
            <b-tooltip dashed multiline label="Matched agencies; see 'Data Sources' below for full details">
              Agencies
            </b-tooltip>
          </td>
          <td>
            <ul>
              <li v-for="k of agencyNames" :key="k">
                {{ k }}
              </li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            Locations
          </td>
          <td>
            <ul>
              <li v-for="location of locations" :key="location.name">
                <nuxt-link :to="{name:'operators', query:{adm0name:location.adm0name}}">
                  {{ location.adm0name }}
                </nuxt-link>
                <template v-if="location.adm1name">
                  /
                  <nuxt-link :to="{name:'operators', query:{adm1name:location.adm1name}}">
                    {{ location.adm1name }}
                  </nuxt-link>
                </template>
                <template v-if="location.name">
                  /
                  <nuxt-link :to="{name:'operators', query:{city_name:location.name}}">
                    {{ location.name }}
                  </nuxt-link>
                </template>
              </li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            Contact
          </td>
          <td>
            <ul>
              <li v-for="k of agencyURLs" :key="k">
                <a v-if="k" :href="k">{{ k }}</a>
              </li>
            </ul>
          </td>
        </tr>
      </table>

      <br>

      <b-tabs v-model="activeTab" type="is-boxed">
        <b-tab-item label="Map">
          <!-- need fvids for good index search -->
          <feed-version-map-viewer :fvids="fvids" :agency-ids="agencyIds" :overlay="true" />
        </b-tab-item>
        <b-tab-item label="Data sources">
          <b-notification type="is-light" has-icon icon="information" :closable="false">
            This operator includes the references listed below. Each reference may match one or more agencies imported from a GTFS feed. These agencies contain the routes, stops, schedules, and other information used for this operator. Clicking the link to a given source feed or matched agency will take you to the data source page for that feed. If a reference to an agency cannot be resolved, this will be noted.
          </b-notification>

          <b-table
            :data="sources"
            :striped="true"
            sort-icon="menu-up"
          >
            <b-table-column v-slot="props" field="agency" label="Association type">
              {{ props.row.target_type }}
            </b-table-column>
            <b-table-column v-slot="props" field="agency" label="Source Feed">
              <nuxt-link :to="{name:'data-feed', params:{feed:props.row.target_feed}}">
                {{ props.row.target_feed }}
              </nuxt-link>
            </b-table-column>
            <b-table-column v-slot="props" field="agency" label="Source Agency ID">
              {{ props.row.target_id }}
            </b-table-column>
            <b-table-column v-slot="props" field="agency" label="Matched Agency">
              <template v-if="props.row.target_match">
                <nuxt-link :to="{name:'data-feed-versions-version-agencies-agency', params:{feed:props.row.target_feed, version:props.row.target_match.feed_version.sha1, agency:props.row.target_match.agency_id}}">
                  {{ props.row.target_match.agency_name }}
                </nuxt-link>
              </template>
              <template v-else-if="!props.row.target_id" /><template v-else>
                <b-tooltip dashed label="No active agency with this source feed and agency ID could be located">
                  No
                </b-tooltip>
              </template>
            </b-table-column>
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
          operator_onestop_id: this.onestopId
        }
      },
      update (data) {
        this.operators = data.operators
        this.matches = data.matches
      }
    }
  },
  data () {
    return {
      activeTab: 0,
      operators: [],
      matches: [],
      error: null
    }
  },
  computed: {
    editLink () {
      return `https://github.com/transitland/transitland-atlas/blob/master/operators/${this.onestopId}.json`
    },
    newLink () {
      return `https://github.com/transitland/transitland-atlas/new/master/operators?filename=${this.onestopId}.json`
    },
    locations () {
      const ret = {}
      for (const ent of this.agencies) {
        for (const p of ent.places || []) {
          const key = `{p.adm0name} / ${p.adm1name} - ${p.name}`
          ret[key] = p
        }
      }
      const ret2 = []
      for (const key of Object.keys(ret).sort()) {
        ret2.push(ret[key])
      }
      return ret2
    },
    agencies () {
      const ret = []
      for (const ent of this.matches) {
        if (ent.agency) {
          ret.push(ent.agency)
        }
      }
      return ret
    },
    onestopId () {
      return this.$route.params.operator
    },
    agencyIds () {
      return this.agencies.map((s) => { return s.id }).filter((s) => { return s })
    },
    agencyNames () {
      return [...new Set(this.agencies.map((s) => { return s.agency_name }))]
    },
    agencyURLs () {
      return [...new Set(this.agencies.map((s) => { return s.agency_url }))]
    },
    fvids () {
      return this.agencies.map((s) => { return s.feed_version.id })
    },
    operator () {
      if (this.operators && this.operators.length > 0) {
        return this.operators[0]
      }
      return null
    },
    generatedOperator () {
      return this.operators.length === 0
    },
    operatorName () {
      if (this.operator) {
        return this.operator.name
      } else if (this.agencies && this.agencies.length > 0) {
        return this.agencies[0].agency_name
      } else {
        return ''
      }
    },
    sources () {
      const ret = []
      const amap = {}
      if (this.generatedOperator) {
        for (const ent of this.agencies) {
          ret.push({
            target_type: 'Generated',
            target_feed: ent.feed_version.current_feed.onestop_id,
            target_match: ent
          })
        }
      }
      for (const ent of this.agencies) {
        const key = `${ent.feed_version.onestop_id}:${ent.agency_id}`
        amap[key] = ent
        if (ent.feed_version && ent.feed_version.current_feed && ent.feed_version.current_feed.feed_namespace_id === this.onestopId) {
          ret.push({
            target_type: 'Feed Namespace',
            target_feed: ent.feed_version.current_feed.onestop_id,
            target_match: ent
          })
        }
      }
      for (const ent of this.operators || []) {
        // check if the json column value is an array
        const af = ent.associated_feeds || []
        if (!Array.isArray(af)) {
          continue
        }
        for (const a of af) {
          const key = `${a.feed_onestop_id}:${a.gtfs_agency_id}`
          ret.push({
            target_type: 'Associated Feed',
            target_feed: a.feed_onestop_id,
            target_id: a.gtfs_agency_id,
            target_match: amap[key]
          })
        }
      }
      return ret
    }
  },
  head () {
    const feedsNumber = new Set(this.sources.map(s => s.target_feed)).size
    const locations = this.locations
      .map(l => [l.adm0name, l.adm1name, l.name].filter(Boolean).join(', '))
      .join('; ')
    return {
      title: `${this.operatorName} • Operator details`,
      meta: [
        { hid: 'description', name: 'description', content: `${this.operatorName} is an operator listed on the Transitland open data platform. ${this.operatorName} provides transit services in the following locations: ${locations}. Transitland sources data for this operator from ${feedsNumber} GTFS ${feedsNumber > 1 ? 'feeds' : 'feed'}.` }
      ]
    }
  }
}
</script>
