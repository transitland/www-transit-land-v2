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
              {{ entity.feed_version.sha1 | shortenName(6) }}
            </nuxt-link>
          </li>
          <li>
            <nuxt-link :to="{name: 'data-feed-versions-version-stops-stop', params:{feed:$route.params.feed, version:$route.params.version, stop:$route.params.stop }}">
              {{ entity.stop_name }}
            </nuxt-link>
          </li>
        </ul>
      </nav>
      <h1 class="title">
        {{ entity.stop_name }}
      </h1>
      <div class="columns">
        <div class="column is-two-thirds">
          <b-tabs v-model="activeTab" type="is-boxed" :animated="false">
            <b-tab-item label="Summary">
              <div>With service to:</div>
              <div v-for="rs of entity.route_stops" :key="rs.route.id">
                <nuxt-link
                  :to="{name:'data-feed-versions-version-routes-route', params:{feed:$route.params.feed, version:$route.params.version, route:rs.route.route_id}}"
                >
                  <route-icon :route-type="rs.route.route_type" :route-short-name="rs.route.route_short_name" :route-long-name="rs.route.route_long_name" :route-link="rs.route.route_url" />
                </nuxt-link>
              </div>
            </b-tab-item>
          </b-tabs>
        </div>
        <div class="column is-one-third" style="width:400px">
          <map-viewer
            :features="features"
            :auto-fit="false"
            :center="entity.geometry.coordinates"
            :circle-radius="20"
            :zoom="14"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
      query: require('~/graphql/feed-version-stop.gql'),
      variables () {
        return {
          feed_onestop_id: this.$route.params.feed,
          feed_version_sha1: this.$route.params.version,
          stop_id: this.$route.params.stop
        }
      },
      update (data) {
        this.activeEntity = data.active_stops.length > 0 ? data.active_stops[0] : null
        this.versionEntity = data.gtfs_stops.length > 0 ? data.gtfs_stops[0] : null
      }
    }
  },
  computed: {
    features () {
      const ret = []
      ret.push({ type: 'Feature', id: this.entity.id, geometry: this.entity.geometry, properties: { id: this.entity.id } })
      let featid = 1
      for (const rs of this.entity.route_stops) {
        for (const geom of rs.route.geometries || []) {
          featid++
          ret.push(
            { type: 'Feature', id: featid, geometry: geom.geometry, properties: { id: featid, route_type: rs.route.route_type, generated: false, headway_secs: 60 } }
          )
        }
      }
      return ret
    },
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
    }
  },
  head () {
    if (this.entity) {
      return {
        title: `${this.entity.stop_name} (stop)`
      }
    }
  }
}
</script>
