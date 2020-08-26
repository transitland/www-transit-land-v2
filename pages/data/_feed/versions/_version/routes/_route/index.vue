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
              Source Feeds
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
            <nuxt-link :to="{name: 'data-feed-versions-version-agencies-agency', params:{feed:$route.params.feed, version:$route.params.version, agency: entity.agency.agency_id }}">
              {{ entity.agency.agency_name }}
            </nuxt-link>
          </li>
          <li>
            <nuxt-link :to="{name: 'data-feed-versions-version-routes-route', params:$route.params}">
              {{ entity.route_short_name || entity.route_long_name }}
            </nuxt-link>
          </li>
        </ul>
      </nav>
      <h1 class="title">
        {{ entity.agency.agency_name }}
      </h1>
      <h1 class="title">
        <route-icon :route-link="entity.route_url" :route-type="entity.route_type" :route-short-name="entity.route_short_name" :route-long-name="entity.route_long_name" />
      </h1>

      <div class="columns">
        <div class="column is-two-thirds">
          <b-tabs v-model="activeTab" type="is-boxed" :animated="false">
            <b-tab-item label="Summary">
              <headway-viewer :headways="entity.headways" />
              <div class="clearfix">
                {{ entity.entity_desc }}
              </div>
            </b-tab-item>

            <b-tab-item label="Inbound">
              <route-trips-viewer v-if="activeTab === 1" :service-date="serviceDate" :route-id="entity.id" :feed-version-id="entity.feed_version_id" :direction-id="0" />
            </b-tab-item>

            <b-tab-item label="Outbound">
              <route-trips-viewer v-if="activeTab === 2" :service-date="serviceDate" :route-id="entity.id" :feed-version-id="entity.feed_version_id" :direction-id="1" />
            </b-tab-item>

            <b-tab-item :label="childLabel">
              <nuxt-child :service-date="serviceDate" :entity="entity" :label.sync="childLabel" />
            </b-tab-item>
          </b-tabs>
        </div>
        <div class="column is-one-third" style="width:400px">
          <feed-version-map-viewer :route-ids="[entity.id]" :overlay="false" :include-stops="true" />

          <div style="margin-left:40px;margin-top:20px;">
            <route-trip-date-selector v-model="serviceDate" :route-id="entity.id" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  data () {
    return {
      map: null,
      selectDate: null,
      activeEntity: null,
      versionEntity: null,
      activeTab: 0,
      childLabel: null,
      error: null
    }
  },
  apollo: {
    q: {
      error (e) { this.error = e },
      query: require('~/graphql/feed-version-route.gql'),
      variables () {
        return {
          feed_onestop_id: this.$route.params.feed,
          feed_version_sha1: this.$route.params.version,
          route_id: this.$route.params.route
        }
      },
      update (data) {
        this.activeEntity = data.active_routes.length > 0 ? data.active_routes[0] : null
        this.versionEntity = data.gtfs_routes.length > 0 ? data.gtfs_routes[0] : null
      }
    }
  },
  computed: {
    entity () {
      if (this.$route.params.version === 'current') {
        return this.activeEntity
      }
      return this.versionEntity
    },
    isCurrentVersion () {
      if (this.$route.params.version === 'current') {
        return true
      }
      if (this.activeEntity && this.versionEntity && this.activeEntity.id === this.versionEntity.id) {
        return true
      }
      return false
    },
    serviceDate: {
      get () {
        return this.$route.query.service_date ? this.$route.query.service_date : moment().format('YYYY-MM-DD')
      },
      set (value) {
        this.$router.push({
          name: this.$router.name,
          query: {
            service_date: value
          }
        })
      }
    }
  },
  watch: {
    childLabel () {
      this.activeTab = 3
    }
  },
  head () {
    if (this.entity) {
      return {
        title: `${this.entity.route_long_name} (route) • ${this.entity.agency.agency_name}`
      }
    }
  }
}
</script>
