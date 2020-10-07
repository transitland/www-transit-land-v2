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
import gql from 'graphql-tag'

const query = gql`
query ($onestop_id: String!) {
  entities: tl_mv_active_stops(limit: 100, order_by: {id: desc}, where: {onestop_id: {_eq: $onestop_id}}) {
    feed_version_id
    id

    stop_name
    geometry
    location_type
    parent_station
    stop_timezone
    stop_url
    wheelchair_boarding
    zone_id
    children {
      id
      stop_id
      stop_name
      geometry
    }
    feed_version {
      id
      sha1
      current_feed {
        id
        onestop_id
      }
    }    
    route_stops {
      route: tl_route {
        id
        onestop_id
        route_long_name
        route_short_name
        route_type
        route_url
        route_id
        geometry
        agency {
          agency_name
          id
        }
      }
    }
  }
}
`

export default {
  data () {
    return {
      entities: [],
      error: null,
      activeTab: 0
    }
  },
  apollo: {
    entities: {
      query,
      variables () {
        return {
          onestop_id: this.$route.params.onestop_id
        }
      }
    }
  },
  computed: {
    features () {
      const ret = []
      let featid = 1
      for (const i of this.entities) {
        featid++
        ret.push({ type: 'Feature', id: featid, geometry: i.geometry, properties: { class: 'stop', id: featid } })
      }
      const sg = this.entity.geometry
      for (const i of this.entity.children) {
        featid++
        ret.push({ type: 'Feature', id: featid, geometry: i.geometry, properties: { class: 'stop', id: featid } })
        featid++
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
      }
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
      console.log('ret:', ret)
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
  }
}
</script>
