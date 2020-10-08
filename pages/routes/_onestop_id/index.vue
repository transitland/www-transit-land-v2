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

      <b-notification v-if="linkVersion" type="is-light" has-icon icon="information" :closable="false">
        You are viewing a specific version of this entity from a single GTFS feed. <br>
        Click <nuxt-link :to="{name: 'routes-onestop_id', params:{onestop_id:$route.params.onestop_id}}">
          here
        </nuxt-link> to return to the main view.
      </b-notification>

      <div class="columns">
        <div class="column is-two-thirds">
          <b-tabs v-model="activeTab" type="is-boxed" :animated="false" @input="setTab">
            <b-tab-item label="Summary">
              <headway-viewer :headways="entity.headways" />
              <div class="clearfix">
                {{ entity.entity_desc }}
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
                <b-table-column v-slot="props" field="route_id" label="Route ID">
                  <nuxt-link :to="{name:'routes-onestop_id', params:{onestop_id:props.row.onestop_id}, query:{feed_onestop_id:props.row.feed_onestop_id, feed_version_sha1:props.row.feed_version_sha1, route_id:props.row.route_id}}">
                    {{ props.row.route_id }}
                  </nuxt-link>
                </b-table-column>
              </b-table>
            </b-tab-item>

            <b-tab-item label="Demographics">
              <census-viewer v-if="activeTab === 1" :route-ids="[entity.id]" />
            </b-tab-item>

            <b-tab-item label="Inbound Trips">
              <route-trips-viewer v-if="activeTab === 2" :service-date="serviceDate" :route-id="entity.id" :feed-version-id="entity.feed_version_id" :direction-id="0" />
            </b-tab-item>

            <b-tab-item label="Outbound Trips">
              <route-trips-viewer v-if="activeTab === 3" :service-date="serviceDate" :route-id="entity.id" :feed-version-id="entity.feed_version_id" :direction-id="1" />
            </b-tab-item>

            <b-tab-item :label="childLabel">
              <nuxt-child :service-date="serviceDate" :entity="entity" :label.sync="childLabel" />
            </b-tab-item>
          </b-tabs>
        </div>
        <div class="column is-one-third" style="width:400px">
          <feed-version-map-viewer :route-ids="entityIds" :overlay="false" :include-stops="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import gql from 'graphql-tag'

const query = gql`
query ($onestop_id: String, $inactive: Boolean, $route_id: String, $feed_onestop_id: String, $feed_version_sha1: String) {
  entities: tl_vw_gtfs_routes(limit: 100, order_by: {id: desc}, where: {onestop_id: {_eq: $onestop_id}, feed_onestop_id:{_eq:$feed_onestop_id}, feed_version_sha1:{_eq:$feed_version_sha1}, route_id:{_eq:$route_id}, feed_version: {feed_states: {id: {_is_null: $inactive}}}}) {
    id
    onestop_id
    feed_onestop_id
    feed_version_sha1
    route_id
    route_color
    route_desc
    route_long_name
    route_short_name
    route_type
    route_url
    agency {
      id
      agency_id
      agency_name
    }
    operator {
      id
      operator_name
      agency_name
      operator_onestop_id
    }
    headways {
      selected_stop_id
      dow_category
      service_date
      direction_id
      headway_secs
      headway_seconds_morning_min
      headway_seconds_midday_min
      headway_seconds_afternoon_min
      headway_seconds_night_min
      headway_seconds_morning_mid
      headway_seconds_midday_mid
      headway_seconds_afternoon_mid
      headway_seconds_night_mid
      headway_seconds_morning_max
      headway_seconds_midday_max
      headway_seconds_afternoon_max
      headway_seconds_night_max
    } 
  }
}
`

export default {
  data () {
    return {
      entities: [],
      selectDate: null,
      activeTab: 0,
      childLabel: null,
      error: null,
      tabIndex: {
        0: 'summary',
        1: 'data-sources',
        2: 'demographics',
        3: 'inbound-trips',
        4: 'outbound-trips'
      }
    }
  },
  apollo: {
    entities: {
      error (e) { this.error = e },
      query,
      variables () {
        return {
          onestop_id: this.$route.params.onestop_id,
          feed_onestop_id: this.$route.query.feed_onestop_id,
          feed_version_sha1: this.$route.query.feed_version_sha1,
          route_id: this.$route.query.route_id,
          inactive: this.linkVersion ? null : false
        }
      }
    }
  },
  computed: {
    linkVersion () {
      return Object.keys(this.$route.query).length > 0
    },
    entity () {
      return this.entities.length > 0 ? this.entities[0] : null
    },
    entityIds () {
      return this.entities.map((s) => { return s.id })
    },
    routeNames () {
      const rs = new Map()
      for (const ent of this.entities) {
        const key = `${ent.agency.agency_name}-${ent.route_id}-${ent.route_short_name}-${ent.route_long_name}-${ent.route_type}`
        rs.set(key, ent)
      }
      return Array.from(rs.values())
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
      this.activeTab = 5
    }
  },
  mounted () {
    const tab = this.$route.hash.substr(1)
    if (tab) {
      for (const [k, v] of Object.entries(this.tabIndex)) {
        if (v === tab) {
          this.activeTab = parseInt(k)
        }
      }
    }
  },
  methods: {
    setTab (value) {
      const tab = this.tabIndex[value]
      if (tab) {
        this.$router.replace({ hash: '#' + tab })
      }
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
