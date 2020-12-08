<template>
  <div class="container">
    <span v-if="$apollo.loading" class="is-loading" />
    <div v-else-if="entity">
      <nav class="breadcrumb">
        <ul>
          <li>
            <nuxt-link :to="{name:'stops'}">
              Stops
            </nuxt-link>
          </li>
          <li>
            <nuxt-link :to="{name: 'stops-onestop_id', params:{onestop_id:$route.params.onestop_id}}">
              {{ entity.stop_name }}
            </nuxt-link>
          </li>
        </ul>
      </nav>
      <h1 class="title">
        {{ entity.stop_name }}
      </h1>

      <!-- Warnings for freshness and viewing a specific version -->
      <b-message v-if="dataFreshness > 365" type="is-warning" has-icon>
        The GTFS feeds associated with this page were fetched {{ dataFreshness }} days ago; use caution or check if newer data is available.
      </b-message>
      <b-message v-if="linkVersion" type="is-warning" has-icon>
        You are viewing a single GTFS Stop entity defined in source feed
        <nuxt-link :to="{name:'feeds-feed', params:{feed:$route.query.feed_onestop_id}}">
          {{ $route.query.feed_onestop_id | shortenName }}
        </nuxt-link> version
        <nuxt-link :to="{name:'feeds-feed-versions-version', params:{feed:$route.query.feed_onestop_id, version:$route.query.feed_version_sha1}}">
          {{ $route.query.feed_version_sha1 | shortenName(8) }}
        </nuxt-link>.<br>
        <template v-if="!search">
          Click <nuxt-link :to="{name: 'routes-onestop_id', params:{onestop_id:$route.params.onestop_id}}">
            here
          </nuxt-link> to return to the main view.
        </template>
      </b-message>

      <!-- Main content -->
      <div class="columns">
        <div class="column is-two-thirds">
          <b-tabs v-model="activeTab" type="is-boxed" :animated="false">
            <b-tab-item label="Summary">
              <div>This stop is served by the following routes:</div>
              <div v-for="rs of entity.route_stops" :key="rs.route.id">
                <nuxt-link
                  :to="{name:'routes-onestop_id', params:{onestop_id:rs.route.onestop_id}}"
                >
                  <route-icon :route-type="rs.route.route_type" :route-short-name="rs.route.route_short_name" :route-long-name="rs.route.route_long_name" :route-link="rs.route.route_url" />
                </nuxt-link>
              </div>
            </b-tab-item>

            <!-- Data sources -->
            <b-tab-item label="Sources">
              <b-table
                :data="entities"
                :striped="true"
              >
                <b-table-column v-slot="props" field="feed_onestop_id" label="Feed">
                  <nuxt-link :to="{name:'feeds-feed', params:{feed:props.row.feed_onestop_id}}">
                    {{ props.row.feed_onestop_id | shortenName }}
                  </nuxt-link>
                </b-table-column>
                <b-table-column v-slot="props" field="feed_version_sha1" label="Version">
                  <nuxt-link :to="{name:'feeds-feed-versions-version', params:{feed:props.row.feed_onestop_id, version:props.row.feed_version_sha1}}">
                    {{ props.row.feed_version_sha1 | shortenName(8) }}
                  </nuxt-link>
                </b-table-column>
                <b-table-column v-slot="props" field="route_id" label="Route ID">
                  <nuxt-link :to="{name:'stops-onestop_id', params:{onestop_id:props.row.onestop_id || 'search'}, query:{feed_onestop_id:props.row.feed_onestop_id, feed_version_sha1:props.row.feed_version_sha1, stop_id:props.row.stop_id}}">
                    {{ props.row.stop_id | shortenName }}
                  </nuxt-link>
                </b-table-column>
              </b-table>
            </b-tab-item>
          </b-tabs>
        </div>
        <div class="column is-one-third" style="width:400px">
          <map-viewer
            :stop-features="stopFeatures"
            :route-features="routeFeatures"
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
import EntityPageMixin from '~/components/entity-page-mixin'

export default {
  mixins: [EntityPageMixin],
  data () {
    return {}
  },
  apollo: {
    query: {
      query: require('~/graphql/feed-version-stop.gql'),
      variables () {
        return {
          onestop_id: this.$route.params.onestop_id,
          feed_onestop_id: this.$route.query.feed_onestop_id,
          feed_version_sha1: this.$route.query.feed_version_sha1,
          stop_id: this.$route.query.stop_id,
          inactive: false
        }
      }
    }
  },
  computed: {
    stopFeatures () {
      const ret = []
      for (const i of this.entities) {
        ret.push({ type: 'Feature', id: i.id, geometry: i.geometry, properties: { class: 'stop', id: i.id } })
      }
      for (const i of this.entity.children) {
        ret.push({ type: 'Feature', id: i.id, geometry: i.geometry, properties: { class: 'stop', id: i.id } })
      }
      return ret
    },
    routeFeatures () {
      const ret = []
      let featid = 1
      for (const rs of this.entity.route_stops) {
        featid++
        ret.push(
          {
            type: 'Feature',
            id: featid,
            geometry: rs.route.geometry,
            properties: {
              class: 'route',
              id: featid,
              route_type: rs.route.route_type,
              generated: false,
              headway_secs: 60
            }
          }
        )
      }
      return ret
    },
    features () {
      const ret = []
      const sg = this.entity.geometry
      let featid = 1
      for (const i of this.entity.children) {
        ret.push({
          type: 'Feature',
          id: featid,
          properties: { },
          geometry: {
            type: 'LineString',
            coordinates: [
              sg.coordinates,
              i.geometry.coordinates
            ]
          }
        })
        featid++
      }
      return ret
    },
    entity () {
      if (this.entities.length === 0) {
        return null
      }
      const b = this.entities[0]
      const rs = new Map()
      for (const ent of this.entities) {
        for (const i of ent.route_stops) {
          rs.set(i.route.onestop_id, i)
        }
      }
      const children = new Map()
      for (const ent of this.entities) {
        for (const i of ent.children) {
          children.set(i.id, i)
        }
      }
      const ent = {
        feed_version: b.feed_version,
        stop_name: b.stop_name,
        geometry: b.geometry,
        route_stops: Array.from(rs.values()),
        children: Array.from(children.values())
      }
      return ent
    }
  },
  head () {
    if (this.entity) {
      return {
        title: this.entity.stop_name,
        meta: [
          { hid: 'description', name: 'description', content: `${this.entity.stop_name} is a stop ` }
        ]
      }
    }
  }
}
</script>
