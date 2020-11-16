<template>
  <div>
    <span v-if="$apollo.loading" class="is-loading" />
    <div v-else-if="entity">
      <nav class="breadcrumb">
        <ul>
          <li>
            <nuxt-link :to="{name:'operators'}">
              Operators
            </nuxt-link>
          </li><li>
            <nuxt-link :to="{name:'operators-onestop_id', params:{onestop_id:$route.params.onestop_id}}">
              {{ operatorName }}
            </nuxt-link>
          </li>
        </ul>
      </nav>
      <h1 class="title">
        {{ operatorName }}
      </h1>

      <!-- Warnings for freshness and viewing a specific version -->
      <b-message v-if="dataFreshness > 365" type="is-warning" has-icon>
        The GTFS feeds associated with this page were fetched {{ dataFreshness }} days ago; use caution or check if newer data is available.
      </b-message>
      <b-message v-if="linkVersion" type="is-warning" has-icon>
        You are viewing a single GTFS Agency entity defined in source feed
        <nuxt-link :to="{name:'feeds-feed', params:{feed:$route.query.feed_onestop_id}}">
          {{ $route.query.feed_onestop_id | shortenName }}
        </nuxt-link> version
        <nuxt-link :to="{name:'feeds-feed-versions-version', params:{feed:$route.query.feed_onestop_id, version:$route.query.feed_version_sha1}}">
          {{ $route.query.feed_version_sha1 | shortenName(8) }}
        </nuxt-link>.<br>
        <template v-if="!search">
          Click <nuxt-link :to="{name: 'operators-onestop_id', params:{onestop_id:$route.params.onestop_id}}">
            here
          </nuxt-link> to return to the main view.
        </template>
      </b-message>

      <b-message v-else type="is-info" has-icon icon="information" :closable="false">
        <div class="columns">
          <div class="column is-8">
            <p>
              The metadata associated with this operator record can be edited in the <a href="https://github.com/transitland/transitland-atlas">Transitland Atlas</a> repository. We welcome edits and additions. Press the button at right to start a pull request.
            </p>
          </div>
          <div class="column is-4 has-text-right">
            <b-tooltip label="Create or edit an associated operator metadata file in the Transitland Atlas repository">
              <a v-if="operator" class="button is-primary" :href="editLink" target="_blank"><b-icon icon="pencil" size="is-small" /> &nbsp; Edit Operator Record</a>
              <a v-else class="button is-primary" :href="newLink" target="_blank"><b-icon icon="pencil" size="is-small" /> &nbsp; Create Operator Record</a>
            </b-tooltip>
          </div>
        </div>
      </b-message>

      <!-- Main content -->
      <table class="property-list">
        <tr>
          <td>
            <b-tooltip dashed label="A globally unique identifier for this operator">
              Onestop ID
            </b-tooltip>
          </td>
          <td>{{ onestopId }}</td>
        </tr>
        <tr>
          <td>
            <b-tooltip dashed multiline label="Matched agencies; see 'Sources' below for full details">
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
            <b-tooltip dashed multiline label="Operators and their service areas are matched against place names from the Natural Earth project">
              Locations
            </b-tooltip>
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
                {{ k }}
              </li>
            </ul>
          </td>
        </tr>
        <tr v-if="operator && operator.tags && Object.keys(operator.tags).length > 0">
          <td>
            <b-tooltip dashed multiline label="Links between Transitland and other catalogs and data sources on the Internet">
              ID Crosswalk
            </b-tooltip>
          </td>
          <td>
            <ul>
              <li v-if="operator.tags.us_ntd_id">
                US National Transit Database (NTD) ID: <code>{{ operator.tags.us_ntd_id }}</code> <a target="_blank" href="https://www.transit.dot.gov/ntd/"><b-icon icon="link" title="US National Transit Database website" /></a>
              </li>
              <li v-if="operator.tags.omd_provider_id">
                OpenMobilityData Provider ID: <code>{{ operator.tags.omd_provider_id }}</code> <a target="_blank" :href="`https://openmobilitydata.org/p/${operator.tags.omd_provider_id}`"><b-icon icon="link" title="OpenMobilityData provider page" /></a>
              </li>
              <li v-if="operator.tags.wikidata_id">
                Wikidata Entity ID: <code>{{ operator.tags.wikidata_id }}</code> <a target="_blank" :href="`https://www.wikidata.org/wiki/${operator.tags.wikidata_id}`"><b-icon icon="link" title="Wikidata entity query page" /></a>
              </li>
            </ul>
          </td>
        </tr>
      </table>
      <hr>
      <h4 class="title is-4">
        Source Feed(s)
      </h4>

      <b-tabs type="is-boxed" :animated="false">
        <b-tab-item label="Source Feeds">
          <b-message
            v-for="feedOnestopId in new Set(sources.map(s => s.target_feed))"
            :key="feedOnestopId"
            type="is-success"
            has-icon
            icon="information"
            :closable="false"
          >
            <div class="columns">
              <div class="column is-8">
                <p>
                  This operator includes data from the feed record with Onestop ID of
                  <code>{{ feedOnestopId }}</code> See the feed record for Transitland's archive of fetched versions, as well as URLs for accessing the feed. <!-- TODO: show different text depending upon feed.spec = GTFS, GTFS-RT, or GBFS -->
                </p>
              </div>
              <div class="column is-4 has-text-right">
                <nuxt-link class="button is-primary" :to="{name:'feeds-feed', params:{feed:feedOnestopId}}">
                  View Feed Record
                </nuxt-link>
              </div>
            </div>
          </b-message>
        </b-tab-item>
        <b-tab-item label="Source Feeds (Advanced View)">
          <b-message type="is-light" has-icon icon="information" :closable="false">
            This operator includes data from the references listed below. These references are defined in the Operator's Atlas record, and describe the GTFS Agencies that provide the routes, stops, schedules, and other information for this operator. If a reference to an agency cannot be resolved, this will be noted. Please see the <nuxt-link :to="{name:'documentation'}">
              Operator documentation
            </nuxt-link> for more information on this process.
          </b-message>
          <div class="content">
            <b-table
              :data="sources"
              :striped="true"
              sort-icon="menu-up"
            >
              <b-table-column v-slot="props" field="agency" label="Association type">
                {{ props.row.target_type }}
              </b-table-column>
              <!-- TODO: add a column for feed spec -->
              <b-table-column v-slot="props" field="agency" label="Source Feed">
                <nuxt-link :to="{name:'feeds-feed', params:{feed:props.row.target_feed}}">
                  {{ props.row.target_feed }}
                </nuxt-link>
              </b-table-column>
              <b-table-column v-slot="props" field="agency" label="Source Agency ID">
                {{ props.row.target_id }}
              </b-table-column>
              <b-table-column v-slot="props" field="agency" label="Matched Agency">
                <template v-if="props.row.target_match">
                  <b-icon icon="check" />
                  {{ props.row.target_match.agency_name }}
                </template>
                <template v-else>
                  <b-tooltip dashed label="The active version of this source feed does not contain a matching agency">
                    <b-icon icon="alert" />
                  </b-tooltip>
                </template>
              </b-table-column>
            </b-table>
          </div>
        </b-tab-item>
      </b-tabs>
      <hr>
      <!-- anchors for when users click between tabs -->
      <a v-for="[, value] of Object.entries(tabIndex)" :key="value" :name="value" />
      <h4 class="title is-4">
        Operator Service
      </h4>
      <b-tabs v-model="activeTab" type="is-boxed" :animated="false" @input="setTab">
        <b-tab-item label="Map">
          <!-- need fvids for good index search -->
          <feed-version-map-viewer v-if="activeTab === 0" :fvids="fvids" :agency-ids="agencyIds" :overlay="true" :link-version="linkVersion" />
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
import EntityPageMixin from '~/components/entity-page-mixin'

export default {
  mixins: [EntityPageMixin],
  data () {
    return {
      tabIndex: {
        0: 'map',
        1: 'routes',
        2: 'stops'
      }
    }
  },
  apollo: {
    query: {
      query: require('~/graphql/agency-operator.gql'),
      variables () {
        return {
          onestop_id: this.linkVersion ? null : this.$route.params.onestop_id,
          feed_onestop_id: this.$route.query.feed_onestop_id,
          feed_version_sha1: this.$route.query.feed_version_sha1,
          agency_id: this.$route.query.agency_id,
          active_null: this.linkVersion ? null : false
        }
      }
    }
  },
  computed: {
    dataFreshness () {
      // The fetched_at is on agencies, not the top level entities
      const daysAgo = []
      const n = new Date()
      try {
        for (const ent of this.agencies) {
          const n2 = Date.parse(ent.feed_version.fetched_at)
          daysAgo.push(Math.floor((n2 - n) / (1000 * 3600 * 24 * -1)))
        }
      } catch {
      }
      return Math.max(...daysAgo)
    },
    editLink () {
      return `https://github.com/transitland/transitland-atlas/edit/master/operators/${this.onestopId}.json`
    },
    newLink () {
      return `https://github.com/transitland/transitland-atlas/new/master/operators?filename=${this.onestopId}.json`
    },
    locations () {
      const ret = new Map()
      for (const ent of this.agencies) {
        for (const p of ent.places || []) {
          const key = `{p.adm0name} / ${p.adm1name} - ${p.name}`
          ret.set(key, p)
        }
      }
      return Array.from(ret.values()).sort()
    },
    operators () {
      const rs = new Map()
      for (const ent of this.entities) {
        if (ent.operator) {
          rs.set(ent.operator.id, ent.operator)
        }
      }
      return Array.from(rs.values())
    },
    agencies () {
      const rs = new Map()
      for (const ent of this.entities) {
        if (ent.agency) {
          rs.set(ent.agency.id, ent.agency)
        }
      }
      return Array.from(rs.values())
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
      const amap = new Map()
      if (this.generatedOperator) {
        for (const ent of this.agencies) {
          ret.push({
            target_type: 'Generated',
            target_feed: ent.feed_onestop_id,
            target_match: ent
          })
        }
      }
      for (const ent of this.agencies) {
        const key = `${ent.feed_onestop_id}:${ent.agency_id}`
        amap.set(key, ent)
        if (ent.feed_version && ent.feed_version.current_feed && ent.feed_version.current_feed.feed_namespace_id === this.onestopId) {
          ret.push({
            target_type: 'Feed Namespace',
            target_feed: ent.feed_onestop_id,
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
            target_match: amap.get(key)
          })
        }
      }
      if (ret.length === 0) {
        ret.push({
          target_type: 'No Associations'
        })
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
