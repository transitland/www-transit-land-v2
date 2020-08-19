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
              <div class="clearfix">
                {{ entity.stop_name }}
              </div>
            </b-tab-item>
          </b-tabs>
        </div>

        <div class="column is-one-third" style="width:400px">
          <feed-version-map-viewer :route-ids="[entity.id]" :overlay="false" />
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
        title: `${this.entity.route_long_name} (stop)`
      }
    }
  }
}
</script>
