<template>
  <div>
    <b-message v-if="error" class="is-danger">
      {{ error }}
    </b-message>
    <span v-else-if="$apollo.loading" class="is-loading" />
    <div v-else-if="entity">
      <nav class="breadcrumb">
        <ul>
          <li>
            <nuxt-link :to="{name:'data'}">
              Data
            </nuxt-link>
          </li>
          <li>
            <nuxt-link :to="{name: 'data-feed', params:{feed:$route.params.feed}}">
              {{ $route.params.feed | shortenName }}
            </nuxt-link>
          </li>
          <li>
            <nuxt-link :to="{name: 'data-feed-versions-version', params:{feed:$route.params.feed, version:$route.params.version}}">
              {{ $route.params.version | shortenName(6) }}
            </nuxt-link>
          </li>
          <li>
            <nuxt-link :to="{name: 'data-feed-versions-version-agencies-agency', params:{feed:$route.params.feed, version:$route.params.version, agency: entity.agency_id }}">
              {{ entity.agency_name }}
            </nuxt-link>
          </li>
        </ul>
      </nav>
      <h1 class="title clearfix">
        {{ entity.agency_name }}
      </h1>

      <b-notification v-if="hasMultipleAgencies" type="is-light" has-icon icon="information" :closable="false">
        You are viewing the map, route, and stops for a single agency, {{ entity.agency_name }} (Agency ID: {{ entity.agency_id }})in a feed, {{ entity.feed_version.current_feed.onestop_id }}, which contains multiple agencies.
        Click <nuxt-link :to="{name: 'data-feed-versions-version', params:{feed:$route.params.feed, version:$route.params.version}}">
          here
        </nuxt-link> to view all agencies in this feed.
      </b-notification>

      <table class="property-list">
        <tr>
          <td>Agency phone</td>
          <td>{{ entity.agency_phone }}</td>
        </tr>
        <tr>
          <td>Agency website</td>
          <td>{{ entity.agency_url }}</td>
        </tr>
        <tr>
          <td>Fares</td>
          <td>
            <span v-if="entity.fare_attributes.length > 0">
              {{ fareMin }} - {{ fareMax }} {{ entity.fare_attributes[0].currency_type }}
            </span>
            <span v-else>Not present</span>
          </td>
        </tr>
      </table>

      <br>

      <b-tabs v-model="activeTab" type="is-boxed">
        <b-tab-item label="Map">
          <feed-version-map-viewer :agency-ids="[entity.id]" :overlay="true" />
        </b-tab-item>

        <b-tab-item label="Routes">
          <route-viewer v-if="activeTab === 1" :agency-ids="[entity.id]" :show-agency="false" />
        </b-tab-item>

        <b-tab-item label="Stops">
          <stop-viewer v-if="activeTab === 2" :fvids="[entity.feed_version.id]" :agency-ids="[entity.id]" :show-agencies="false" />
        </b-tab-item>
      </b-tabs>
    </div>
  </div>
</template>

<script>
export default {
  apollo: {
    q: {
      query: require('~/graphql/feed-version-agency.gql'),
      variables () {
        return {
          feed_onestop_id: this.$route.params.feed,
          feed_version_sha1: this.$route.params.version,
          agency_id: this.$route.params.agency
        }
      },
      error (e) { this.error = e },
      update (data) {
        this.active_agencies = data.active_agencies
        this.gtfs_agencies = data.gtfs_agencies
      }
    }
  },
  data () {
    return {
      activeTab: 0,
      active_agencies: [],
      gtfs_agencies: [],
      error: null
    }
  },
  computed: {
    fareMin () {
      return Math.min(...this.entity.fare_attributes.map((s) => { return s.price }))
    },
    fareMax () {
      return Math.max(...this.entity.fare_attributes.map((s) => { return s.price }))
    },
    hasMultipleAgencies () {
      return this.entity.feed_version.agencies.length > 1
    },
    entity () {
      return this.gtfs_agencies.length > 0 ? this.gtfs_agencies[0] : null
    }
  },
  head () {
    if (this.entity) {
      return {
        title: `${this.entity.agency_name} • agency`
      }
    }
  }
}
</script>
