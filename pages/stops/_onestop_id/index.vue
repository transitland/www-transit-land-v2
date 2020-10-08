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

      <b-notification v-if="linkActive" type="is-light" has-icon icon="information" :closable="false">
        You are viewing a specific version of this entity from a single GTFS feed. <br>
        Click <nuxt-link :to="{name: 'stops-onestop_id', params:{onestop_id:$route.params.onestop_id}}">
          here
        </nuxt-link> to return to the main view.
      </b-notification>

      <div class="columns">
        <div class="column is-two-thirds">
          <b-tabs v-model="activeTab" type="is-boxed" :animated="false">
            <b-tab-item label="Summary">
              <div>With service to:</div>
              <div v-for="rs of entity.route_stops" :key="rs.route.id">
                <nuxt-link
                  :to="{name:'routes-onestop_id', params:{onestop_id:rs.route.onestop_id}}"
                >
                  <route-icon :route-type="rs.route.route_type" :route-short-name="rs.route.route_short_name" :route-long-name="rs.route.route_long_name" :route-link="rs.route.route_url" />
                </nuxt-link>
              </div>
            </b-tab-item>

            <b-tab-item label="Data sources">
              <b-table
                :data="entities"
                :striped="true"
              >
                <b-table-column v-slot="props" field="feed_onestop_id" label="Feed">
                  {{ props.row.feed_onestop_id }}
                </b-table-column>
                <b-table-column v-slot="props" field="feed_version_sha1" label="Version">
                  {{ props.row.feed_version_sha1 }}
                </b-table-column>
                <b-table-column v-slot="props" field="stop_id" label="Stop ID">
                  <nuxt-link :to="{name:'stops-onestop_id', params:{onestop_id:props.row.onestop_id}, query:{feed_onestop_id:props.row.feed_onestop_id, feed_version_sha1:props.row.feed_version_sha1, stop_id:props.row.stop_id}}">
                    {{ props.row.stop_id }}
                  </nuxt-link>
                </b-table-column>
              </b-table>
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
query ($onestop_id: String, $inactive: Boolean, $stop_id: String, $feed_onestop_id: String, $feed_version_sha1: String) {
  entities: tl_vw_gtfs_stops(limit: 100, order_by: {id: desc}, where: {onestop_id: {_eq: $onestop_id}, feed_onestop_id:{_eq:$feed_onestop_id}, feed_version_sha1:{_eq:$feed_version_sha1}, stop_id:{_eq:$stop_id}, feed_version: {feed_states: {id: {_is_null: $inactive}}}}) {
    feed_version_id
    feed_version_sha1
    feed_onestop_id
    onestop_id
    id
    stop_id
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
    linkActive () {
      return Object.keys(this.$route.query).length > 0
    },
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
