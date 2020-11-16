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
          </li>
          <li>
            <nuxt-link v-for="operator of operators" :key="operator.id" :to="{name: 'operators-onestop_id', params:{onestop_id:operator.operator_onestop_id}}">
              {{ operator.operator_name || operator.agency_name || operator.onestop_id }}
            </nuxt-link>
          </li>
          <li>
            <nuxt-link :to="{name: 'routes-onestop_id', params:{onestop_id:$route.params.onestop_id}}">
              {{ entity.route_short_name }} {{ entity.route_long_name }}
            </nuxt-link>
          </li>
        </ul>
      </nav>
      <h1
        v-for="ent of routeNames"
        :key="ent.id"
        class="title"
      >
        {{ ent.agency.agency_name }} <br>
        <route-icon
          :route-link="ent.route_url"
          :route-type="ent.route_type"
          :route-short-name="ent.route_short_name"
          :route-long-name="ent.route_long_name"
        />
      </h1>

      <!-- Warnings for freshness and viewing a specific version -->
      <b-message v-if="dataFreshness > 365" type="is-warning" has-icon>
        The GTFS feeds associated with this page were fetched {{ dataFreshness }} days ago; use caution or check if newer data is available.
      </b-message>
      <b-message v-if="linkVersion" type="is-warning" has-icon>
        You are viewing a single GTFS Route entity defined in source feed
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
          <table class="property-list mb-4">
            <tr>
              <td>
                <b-tooltip dashed label="A globally unique identifier for this route">
                  Onestop ID
                </b-tooltip>
              </td>
              <td>{{ entity.onestop_id }}</td>
            </tr>
            <tr>
              <td>Operated by</td>
              <td>
                <nuxt-link v-for="operator of operators" :key="operator.id" :to="{name: 'operators-onestop_id', params:{onestop_id:operator.operator_onestop_id}}">
                  {{ operator.operator_name || operator.agency_name || operator.onestop_id }}
                </nuxt-link>
              </td>
            </tr>
            <tr>
              <td>GTFS ID</td>
              <td>
                {{ entity.route_id }}
              </td>
            </tr>
            <tr>
              <td>Name (Short)</td>
              <td>
                {{ entity.route_short_name }}
              </td>
            </tr>
            <tr>
              <td>Name (Long)</td>
              <td>
                {{ entity.route_long_name }}
              </td>
            </tr>
            <tr>
              <td>Description</td>
              <td>
                {{ entity.route_desc }}
              </td>
            </tr>
            <tr>
              <td>Vehicle Type</td>
              <td>
                <b-tooltip dashed :label="`Route with route_type = ${entity.route_type}`">
                  {{ entity.route_type | routeTypeToWords }}
                </b-tooltip>
              </td>
            </tr>
            <tr>
              <td>URL</td>
              <td>
                {{ entity.route_url }} <a :href="entity.route_url" target="_blank"><b-icon icon="link" /></a>
              </td>
            </tr>
          </table>
          <b-message class="is-info">
            <p>Learn more about the contents of <code>routes.txt</code> on <a href="https://gtfs.org/reference/static#routestxt" target="_blank">gtfs.org</a>.</p>
          </b-message>
          <b-tabs v-model="activeTab" type="is-boxed" :animated="false" @input="setTab">
            <b-tab-item label="Summary">
              <headway-viewer :headways="entity.headways" />
              <div class="clearfix">
                {{ entity.entity_desc }}
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
                  <nuxt-link :to="{name:'routes-onestop_id', params:{onestop_id:props.row.onestop_id}, query:{feed_onestop_id:props.row.feed_onestop_id, feed_version_sha1:props.row.feed_version_sha1, route_id:props.row.route_id}}">
                    {{ props.row.route_id | shortenName }}
                  </nuxt-link>
                </b-table-column>
              </b-table>
            </b-tab-item>

            <b-tab-item label="Export">
              <route-export
                v-if="activeTab === 2"
                :route-name="routeName"
                :route-features="routeFeatures"
                :stop-features="stopFeatures"
                :route-ids="[entity.id]"
                @setFeatures="features = $event"
              />
            </b-tab-item>

            <b-tab-item label="Inbound Trips">
              Coming soon
              <!-- <route-trips-viewer v-if="activeTab === 2" :service-date="serviceDate" :route-id="entity.id" :feed-version-id="entity.feed_version_id" :direction-id="0" /> -->
            </b-tab-item>

            <b-tab-item label="Outbound Trips">
              Coming soon
              <!-- <route-trips-viewer v-if="activeTab === 3" :service-date="serviceDate" :route-id="entity.id" :feed-version-id="entity.feed_version_id" :direction-id="1" /> -->
            </b-tab-item>

            <b-tab-item :label="childLabel">
              <nuxt-child :service-date="serviceDate" :entity="entity" :label.sync="childLabel" />
            </b-tab-item>
          </b-tabs>
        </div>
        <div class="column is-one-third" style="width:400px">
          <feed-version-map-viewer
            :route-ids="entityIds"
            :overlay="false"
            :include-stops="true"
            :link-version="linkVersion"
            :features="activeTab === 2 ? features : []"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EntityPageMixin from '~/components/entity-page-mixin'
import { routeTypeToWords } from '~/plugins/global'

export default {
  mixins: [EntityPageMixin],
  data () {
    return {
      features: [],
      bufferGeom: null,
      routeGeom: null,
      censusGeoms: null,
      selectDate: null,
      tabIndex: {
        0: 'summary',
        1: 'sources',
        2: 'export',
        3: 'inbound-trips',
        4: 'outbound-trips'
      }
    }
  },
  apollo: {
    query: {
      query: require('~/graphql/feed-version-route.gql'),
      variables () {
        return {
          onestop_id: this.search ? null : this.$route.params.onestop_id,
          feed_onestop_id: this.$route.query.feed_onestop_id,
          feed_version_sha1: this.$route.query.feed_version_sha1,
          route_id: this.$route.query.route_id,
          active_null: this.linkVersion ? null : false
        }
      }
    }
  },
  computed: {
    routeFeatures () {
      const ret = []
      for (const f of this.entities || []) {
        const fcopy = Object.assign({}, f)
        delete fcopy.geometry
        ret.push({
          type: 'Feature',
          geometry: f.geometry,
          properties: fcopy,
          id: f.id
        })
      }
      return ret
    },
    stopFeatures () {
      const ret = []
      for (const f of this.entities || []) {
        for (const g of f.route_stops || []) {
          const fcopy = Object.assign({}, g.stop)
          delete fcopy.geometry
          ret.push({
            type: 'Feature',
            geometry: g.stop.geometry,
            properties: fcopy,
            id: g.stop.id
          })
        }
      }
      return ret
    },
    routeName () {
      if (this.entity) {
        return `${this.entity.agency.agency_name} - ${this.entity.route_short_name} ${this.entity.route_long_name}`
      }
      return 'route'
    },
    routeNames () {
      const rs = new Map()
      for (const ent of this.entities) {
        const key = `${ent.agency.agency_name}-${ent.route_id}-${ent.route_short_name}-${ent.route_long_name}-${ent.route_type}`
        rs.set(key, ent)
      }
      return Array.from(rs.values())
    },
    routeType () {
      if (this.entity) {
        return routeTypeToWords(this.entity.route_type)
      } else {
        return ''
      }
    },
    operators () {
      const rs = new Map()
      for (const ent of this.entities) {
        if (ent.operator) {
          rs.set(ent.operator.onestop_id, ent.operator)
        }
      }
      return Array.from(rs.values())
    },
    serviceDate: {
      get () {
        return this.$route.query.service_date ? this.$route.query.service_date : 'TODO'
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
  head () {
    if (this.entity) {
      return {
        title: `${this.routeName} • ${this.routeType} route`,
        meta: [
          { hid: 'description', name: 'description', content: `${this.routeName} is a ${this.routeType} route available for browsing and analyzing on the Transitland platform.` }
        ]
      }
    }
  }
}
</script>
