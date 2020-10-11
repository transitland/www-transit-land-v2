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

      <!-- Warnings for freshness and viewing a specific version -->
      <b-message v-if="dataFreshness > 365" type="is-warning" has-icon>
        The GTFS feeds associated with this page were fetched {{ dataFreshness }} days ago; use caution or check if newer data is available.
      </b-message>
      <b-message v-if="linkVersion" type="is-warning" has-icon>
        You are viewing a single GTFS Agency entity defined in source feed
        <nuxt-link :to="{name:'data-feed', params:{feed:$route.query.feed_onestop_id}}">
          {{ $route.query.feed_onestop_id | shortenName }}
        </nuxt-link> version
        <nuxt-link :to="{name:'data-feed-versions-version', params:{feed:$route.query.feed_onestop_id, version:$route.query.feed_version_sha1}}">
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
                  <nuxt-link :to="{name:'data-feed', params:{feed:props.row.feed_onestop_id}}">
                    {{ props.row.feed_onestop_id | shortenName }}
                  </nuxt-link>
                </b-table-column>
                <b-table-column v-slot="props" field="feed_version_sha1" label="Version">
                  <nuxt-link :to="{name:'data-feed-versions-version', params:{feed:props.row.feed_onestop_id, version:props.row.feed_version_sha1}}">
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

            <b-tab-item label="Demographics">
              <census-viewer v-if="activeTab === 2" :route-ids="[entity.id]" />
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
          <feed-version-map-viewer :route-ids="entityIds" :overlay="false" :include-stops="true" :link-version="linkVersion" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import EntityPageMixin from '~/components/entity-page-mixin'

export default {
  mixins: [EntityPageMixin],
  data () {
    return {
      selectDate: null,
      tabIndex: {
        0: 'summary',
        1: 'sources',
        2: 'demographics',
        3: 'inbound-trips',
        4: 'outbound-trips'
      }
    }
  },
  apollo: {
    entities: {
      error (e) { this.error = e },
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
  head () {
    if (this.entity) {
      return {
        title: `${this.entity.route_long_name} (route) • ${this.entity.agency.agency_name}`
      }
    }
  }
}
</script>