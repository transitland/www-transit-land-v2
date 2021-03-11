<template>
  <div class="">
    <nav class="breadcrumb">
      <ul>
        <li>
          <nuxt-link :to="{name:'validator'}">
            Validator
          </nuxt-link>
        </li>
      </ul>
    </nav>

    <h1 class="title">
      Transitland GTFS Validator
    </h1>

    <div v-if="mutationLoading">
      Loading...
    </div>
    <div v-else-if="!entity">
      <div class="dropbox">
        <p>Drag a GTFS file to this box, or click to browse.</p>

        <input
          type="file"
          class="input-file"
          @change="upload"
        >
      </div>

      <p style="text-align:center;margin:20px;">
        or
      </p>

      <b-field label="Static GTFS URL">
        <b-input v-model="feedUrl" type="text" placeholder="url" />
      </b-field>
      <br>
      <b-field label="GTFS-Realtime URL">
        <b-input v-model="realtimeUrl" type="text" placeholder="realtime url" />
      </b-field>
      <span class="button" @click="submitUrl">Go</span>
    </div>

    <br>

    <div v-if="networkError">
      <b-message has-icon type="is-danger">
        Validator unavailable: {{ networkError }}
      </b-message>
    </div>

    <div v-if="entity && !entity.success">
      <b-message has-icon type="is-danger">
        Failed to validate file. {{ entity.failure_reason }}
      </b-message>
    </div>

    <!-- copied from feed version -->
    <div v-if="entity && entity.success">
      <nav class="level">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Agencies
            </p>
            <p class="title">
              {{ rowCount['agency.txt'] ? rowCount['agency.txt'].toLocaleString() : '-' }}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Routes
            </p>
            <p class="title">
              {{ rowCount['routes.txt'] ? rowCount['routes.txt'].toLocaleString() : '-' }}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Stops
            </p>
            <p class="title">
              {{ rowCount['stops.txt'] ? rowCount['stops.txt'].toLocaleString() : '-' }}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Earliest Date
            </p>
            <p class="title">
              {{ feedInfoStartDate }}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Latest Date
            </p>
            <p class="title">
              {{ feedInfoEndDate }}
            </p>
          </div>
        </div>
      </nav>

      <b-tabs>
        <b-tab-item v-for="(etg,label) of errorTabGroups" :key="label" :label="label">
          <b-message v-if="etg.length === 0">
            No {{ label.toLowerCase() }} were detected. Hooray!
          </b-message>
          <table v-else class="table shaded" style="width:100%">
            <thead>
              <tr>
                <th>Entity ID</th>
                <th>Field</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody v-for="(errGroup,i) of etg" :key="i">
              <tr class="error-group">
                <td colspan="4">
                  {{ errGroup.filename }} -
                  {{ errGroup.error_type }}
                  <span class="is-pulled-right">Count: {{ errGroup.count }}</span>
                </td>
              </tr>
              <tr v-for="(err,j) of errGroup.errors.slice(0,5)" :key="j">
                <td>{{ err.entity_id }}</td>
                <td>{{ err.field }}</td>
                <td>{{ err.message }}</td>
              </tr>
              <tr v-if="errGroup.count > 5">
                <td />
                <td />
                <td><span class="is-pulled-right">... and {{ errGroup.count - 5 }} more.</span></td>
              </tr>
            </tbody>
          </table>
        </b-tab-item>
      </b-tabs>

      <b-tabs v-model="activeTab" type="is-boxed" :animated="false" @input="setTab">
        <b-tab-item label="Map">
          <div v-if="activeTab === 0">
            <map-viewer
              :route-features="routeFeatures"
              :overlay="true"
              :link="false"
            />
          </div>
        </b-tab-item>

        <b-tab-item label="Files">
          <file-info-viewer :files="entity.files" />
        </b-tab-item>

        <b-tab-item label="Service levels">
          <multi-service-levels
            :use-feed-versions="feedVersions"
            :week-agg="false"
            :show-group-info="false"
            :show-filters="false"
          />
        </b-tab-item>

        <b-tab-item label="Agencies">
          <!-- We're going to show more columns than the main viewer -->
          <table class="table shaded" style="width:100%">
            <thead>
              <th>Agency ID</th>
              <th>Name</th>
              <th>URL</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Language</th>
              <th>Timezone</th>
              <th /></th>
            </thead>
            <tbody>
              <tr v-for="agency of entity.agencies" :key="agency.agency_id">
                <td>{{ agency.agency_id }}</td>
                <td>{{ agency.agency_name }}</td>
                <td :title="agency.agency_url">
                  {{ agency.agency_url | shortenName(16) }}
                </td>
                <td>{{ agency.agency_email }}</td>
                <td>{{ agency.agency_phone }}</td>
                <td>{{ agency.agency_lang }}</td>
                <td>{{ agency.agency_timezone }}</td>
              </tr>
            </tbody>
          </table>
        </b-tab-item>

        <b-tab-item label="Routes">
          <table class="table shaded" style="width:100%">
            <thead>
              <th>Route ID</th>
              <th>Short Name</th>
              <th>Long Name</th>
              <th>Type</th>
              <th>URL</th>
              <th>Description</th>
            </thead>
            <tbody>
              <tr v-for="route of entity.routes" :key="route.route_id">
                <td>{{ route.route_id }}</td>
                <td>{{ route.route_short_name }}</td>
                <td>{{ route.route_long_name }}</td>
                <td>{{ route.route_type }}</td>
                <td :title="route.route_url">
                  {{ route.route_url | shortenName(16) }}
                </td>
                <td>{{ route.route_desc }}</td>
              </tr>
            </tbody>
          </table>
        </b-tab-item>

        <b-tab-item label="Stops">
          <table class="table shaded" style="width:100%">
            <thead>
              <th>Stop ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>URL</th>
              <th>Description</th>
            </thead>
            <tbody>
              <tr v-for="stop of entity.stops" :key="stop.stop_id">
                <td>{{ stop.stop_id }}</td>
                <td>{{ stop.stop_name }}</td>
                <td>{{ stop.location_type }}</td>
                <td :title="stop.stop_url">
                  {{ stop.stop_url | shortenName(16) }}
                </td>
                <td>{{ stop.stop_desc }}</td>
              </tr>
            </tbody>
          </table>
        </b-tab-item>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import EntityPageMixin from '~/components/entity-page-mixin'

const q = gql`
mutation ($file: Upload, $url: String, $realtime_urls: [String!]) { 
    ValidateFile(file: $file, url: $url, realtime_urls: $realtime_urls) { 
        success
        failure_reason
        errors {
          filename
          error_type
          count
          limit
          errors {
            filename
            error_type
            field
            entity_id
            message
          }
        }
        warnings {
          filename
          error_type
          count
          limit
          errors {
            filename
            error_type
            field
            entity_id
            message
          }
        }        
        sha1
        earliest_calendar_date
        latest_calendar_date
        files {
            name
            rows
            size
            sha1
            header
            csv_like
        }
        service_levels(limit: 1000, route_id: null) {
            start_date
            end_date
            monday
            tuesday
            wednesday
            thursday
            friday
            saturday
            sunday
        }
        agencies {
          agency_email
          agency_fare_url
          agency_id
          agency_lang
          agency_name
          agency_phone
          agency_timezone
          agency_url
        }
        stops {
          location_type
          stop_code
          stop_desc
          stop_id
          stop_name
          stop_timezone
          stop_url
          wheelchair_boarding
          zone_id
          geometry
        }
        routes {
          route_id
          route_short_name
          route_long_name
          route_type 
          route_color
          route_text_color
          route_sort_order
          route_url
          route_desc
          geometry
        }
        feed_infos {
          feed_publisher_name
          feed_publisher_url
          feed_lang
          feed_version
          feed_start_date
          feed_end_date         
        }
    } 
}
`

export default {
  mixins: [EntityPageMixin],
  data () {
    return {
      feedUrl: 'https://www.bart.gov/sites/default/files/docs/google_transit_20210322_v01.zip',
      realtimeUrl: 'http://api.bart.gov/gtfsrt/tripupdate.aspx',
      mutationLoading: false,
      networkError: false
    }
  },
  computed: {
    errorTabGroups () {
      if (this.entity) {
        return {
          Errors: this.entity.errors,
          Warnings: this.entity.warnings
        }
      }
      return {}
    },
    feedInfoStartDate () {
      if (this.entity && this.entity.feed_infos.length > 0) {
        return this.entity.feed_infos[0].feed_start_date
      }
      return null
    },
    feedInfoEndDate () {
      if (this.entity && this.entity.feed_infos.length > 0) {
        return this.entity.feed_infos[0].feed_end_date
      }
      return null
    },
    rowCount () {
      const ret = {}
      for (const f of this.entity.files || []) {
        ret[f.name] = f.rows
      }
      return ret
    },
    feedVersions () {
      return this.entity ? [Object.assign({}, this.entity, {
        sha1: 'test',
        url: 'test',
        id: 0,
        fetched_at: '2021-01-01T00:00:00Z',
        feed: { onestop_id: 'test' }
      })] : null
    },
    // based on feed-version-map-viewer
    routeFeatures () {
      const features = []
      let i = 0
      for (const feature of this.entity.routes || []) {
        i++
        if (feature.geometry) {
          let routeColor = feature.route_color
          if (routeColor && routeColor.substr(0, 1) !== '#') {
            routeColor = '#' + routeColor
          }
          const fcopy = Object.assign({}, feature, {
            geometry_length: -1,
            route_color: routeColor,
            headway_secs: feature.headway_seconds_weekday_morning ? feature.headway_seconds_weekday_morning : -1,
            agency_name: ''
          })
          delete fcopy.geometry
          delete fcopy.__typename
          features.push({
            id: i, // feature.id,
            type: 'Feature',
            properties: fcopy,
            geometry: feature.geometry
          })
        }
      }
      return features
    },
    // based on feed-version-map-viewer
    stopFeatures () {
      const features = []
      for (const g of this.stops || []) {
        const fcopy = Object.assign({}, g.stop)
        delete fcopy.geometry
        delete fcopy.__typename
        features.push({
          type: 'Feature',
          geometry: g.stop.geometry,
          properties: fcopy,
          id: g.stop.id
        })
      }
      return features
    }
  },
  methods: {
    validateFeed (file) {
      this.entities = []
      this.mutationLoading = true
      this.$apollo
        .mutate({
          mutation: q,
          variables: {
            file,
            url: this.feedUrl,
            realtime_urls: this.realtimeUrl ? [this.realtimeUrl] : null
          },
          update: (store, { data: { ValidateFile } }) => {
            this.entities = [ValidateFile]
            this.mutationLoading = false
          }
        }).catch((error) => {
          this.mutationLoading = false
          this.networkError = error
          // 'Failed to access validator.'
        })
    },
    submitUrl () {
      this.validateFeed()
    },
    submitDemo () {
      this.validateFeed()
    },
    upload ({ target: { files = [] } }) {
      if (!files.length) {
        return
      }
      this.validateFeed(files[0])
    }
  }
}
</script>

<style scoped>
.error-group td {
  border-bottom:solid 1px #000;
  font-weight: bold;
  background: #ccc;
}

.dropbox {
  outline: 1px dashed grey; /* the dash box */
  outline-offset: -10px;
  background: #efefef;
  color: dimgray;
  padding: 10px 10px;
  min-height: 120; /* minimum height */
  position: relative;
  cursor: pointer;
}

.input-file {
  opacity: 0; /* invisible but it's there! */
  width: 100%;
  height: 120px;
  position: absolute;
  cursor: pointer;
}

.dropbox:hover {
  background: #f6f6f6; /* when mouse over to the drop zone, change color */
}

.dropbox p {
  font-size: 1.2em;
  text-align: center;
  padding: 50px 0;
}
</style>
