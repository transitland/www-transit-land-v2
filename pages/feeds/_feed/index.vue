<template>
  <div class="container">
    <span v-if="$apollo.loading" class="is-loading" />
    <div v-else-if="entity">
      <nav class="breadcrumb">
        <ul>
          <li>
            <nuxt-link :to="{name:'feeds'}">
              Source Feeds
            </nuxt-link>
          </li>
          <li>
            <nuxt-link :to="{name: 'feeds-feed', params:{feed:$route.params.feed}}">
              {{ $route.params.feed }}
            </nuxt-link>
          </li>
        </ul>
      </nav>
      <h1 class="title">
        Feed details: {{ onestopId }}
      </h1>

      <b-message type="is-info" has-icon icon="information" :closable="false">
        <div class="columns">
          <div class="column is-8">
            <p>
              You can update the URLs associated with this Feed record and other metadata in the <a href="https://github.com/transitland/transitland-atlas">Transitland Atlas</a> repository. We welcome edits and additions. Press the button at right to start a pull request.
            </p>
          </div>
          <div class="column is-4 has-text-right">
            <b-tooltip label="Create or edit an associated feed metadata file in the Transitland Atlas repository">
              <a class="button is-primary" :href="editLink" target="_blank"><b-icon icon="pencil" size="is-small" /> &nbsp; Edit Feed Record</a>
            </b-tooltip>
          </div>
        </div>
      </b-message>

      <table class="property-list">
        <tr>
          <td>
            <b-tooltip dashed label="A globally unique identifier for this feed">
              Onestop ID
            </b-tooltip>
          </td>
          <td>
            {{ onestopId }}
          </td>
        </tr>
        <tr>
          <td>Feed <abbr title="Specification">Spec</abbr></td>
          <td>{{ entity.spec.toUpperCase() }}</td>
        </tr>
        <tr>
          <td>URLs</td>
          <td>
            <ul>
              <li v-for="(url,key) in entity.urls" :key="key">
                {{ key }}: {{ url }}
              </li>
            </ul>
          </td>
        </tr>

        <tr v-if="entity.spec == 'gtfs'">
          <td>
            <b-tooltip dashed label="Last time a fetch successfully returned valid GTFS data">
              Last Fetch
            </b-tooltip>
          </td>
          <td>
            <template v-if="entity.feed_state && entity.feed_state.last_successful_fetch_at">
              {{ entity.feed_state.last_successful_fetch_at | formatDate }} ({{ entity.feed_state.last_successful_fetch_at | fromNow }})
            </template>
            <template v-else>
              Unknown
            </template>
          </td>
        </tr>

        <tr v-if="entity.spec == 'gtfs' && entity.feed_state.last_fetch_error">
          <td>
            <b-tooltip dashed label="Error message from last fetch attempt">
              Fetch Error
            </b-tooltip>
          </td>
          <td>{{ entity.feed_state.last_fetch_error }}</td>
        </tr>

        <tr v-if="entity.authorization">
          <td>Authorization</td>
          <td>{{ entity.authorization }}</td>
        </tr>
        <tr v-if="entity.license">
          <td>License</td>
          <td>
            <ul>
              <li v-if="entity.license.url">
                License URL: {{ entity.license.url }}
              </li>
              <li v-if="entity.license.spdx_identifier">
                License Identifier: {{ entity.license.spdx_identifier }}
              </li>
              <li v-if="entity.license.use_without_attribution">
                Use allowed without attribution: {{ entity.license.use_without_attribution | capitalize }}
              </li>
              <li v-if="entity.license.share_alike_optional">
                Share-alike optional: {{ entity.license.share_alike_optional | capitalize }}
              </li>
              <li v-if="entity.license.commercial_use_allowed">
                Commercial use allowed: {{ entity.license.commercial_use_allowed | capitalize }}
              </li>
              <li v-if="entity.license.create_derived_product">
                Creating derived products allowed: {{ entity.license.create_derived_product | capitalize }}
              </li>
              <li v-if="entity.license.redistribute">
                Redistribution allowed: {{ entity.license.redistribute | capitalize }}
              </li>
              <li v-if="entity.license.attribution_text">
                Required attribution text: {{ entity.license.attribution_text }}
              </li>
              <li v-if="entity.license.attribution_instructions">
                Attribution instructions: {{ entity.license.attribution_instructions }}
              </li>
            </ul>
          </td>
        </tr>
        <tr v-if="entity.languages">
          <td>Languages</td>
          <td>{{ entity.languages }}</td>
        </tr>
      </table>
      <hr>
      <h4 class="title is-4">
        Operator(s) Associated with this Feed
      </h4>
      <b-tabs type="is-boxed" :animated="false">
        <b-tab-item label="Operators">
          <b-message
            v-for="(match,i) of entity.associated_operators"
            :key="i"
            type="is-success"
            has-icon
            icon="information"
            :closable="false"
          >
            <div class="columns">
              <div class="column is-8">
                <p>
                  This feed is associated with the operator record with Onestop ID of
                  <code>{{ match.onestop_id }}</code> See this operator for more metadata related to this feed and to explore routes, stops, and other data imported from this feed.
                </p>
              </div>
              <div class="column is-4 has-text-right">
                <nuxt-link class="button is-primary" :to="{name:'operators-onestop_id', params:{onestop_id:match.onestop_id}}">
                  View Operator Record
                </nuxt-link>
              </div>
            </div>
          </b-message>
        </b-tab-item>
        <b-tab-item label="Operators (Advanced View)">
          <b-message type="is-light" has-icon icon="information" :closable="false">
            This feed contributes data to the following Operators. These associations are based on the references defined in each Operator's Atlas record. Additionally, GTFS Agencies that do not have defined references to any Operator record are assigned an automatically generated Onestop ID. Please see the <nuxt-link :to="{name:'documentation'}">
              Operator documentation
            </nuxt-link> for more information on this process.
          </b-message>
          <div class="content">
            <table class="table is-shaded">
              <thead>
                <tr>
                  <th>Association type</th>
                  <th>Operator Name</th>
                  <th>Operator Onestop ID</th>
                  <th>GTFS Agency ID in Source Feed</th>
                  <th>Matched Agency</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(match,i) of entity.associated_operators" :key="i">
                  <td>
                    <span v-if="match.operator_id">Associated Feed</span>
                    <span v-else-if="entity.feed_namespace_id === match.onestop_id">Feed Namespace</span>
                    <span v-else>Generated</span>
                  </td>
                  <td>
                    {{ match.operator_name }}
                  </td>
                  <td>
                    <nuxt-link :to="{name:'operators-onestop_id', params:{onestop_id:match.onestop_id}}">
                      {{ match.onestop_id }}
                    </nuxt-link>
                  </td>
                  <td><span v-if="match.agency">{{ match.agency.agency_id }}</span></td>
                  <td>
                    <span v-if="match.agency">
                      <b-icon icon="check" />
                      {{ match.agency.agency_name }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </b-tab-item>
      </b-tabs>

      <hr>

      <div v-if="entity.spec == 'gtfs'">
        <h4 class="title is-4">
          Feed Versions Archived by Transitland
        </h4>

        <!-- <multi-service-levels :max-weeks="52" :week-agg="true" :fvids="entity.feed_versions.map((s)=>{return s.id}).slice(0,20)" /> -->

        <b-table
          :data="entity.feed_versions"
          :striped="true"
          :paginated="true"
          :pagination-simple="true"
          sort-icon="menu-up"
        >
          <b-table-column
            v-slot="props"
            :sortable="true"
            field="fetched_at"
            label="Fetched"
          >
            <template v-if="props.row.fetched_at">
              {{ props.row.fetched_at | formatDate }} ({{ props.row.fetched_at | fromNow }})
            </template>
            <template v-else>
              Unknown
            </template>
          </b-table-column>
          <b-table-column v-slot="props" :sortable="true" field="sha1" label="SHA1">
            <nuxt-link
              :to="{name: 'feeds-feed-versions-version', params: {feed: entity.onestop_id, version: props.row.sha1}}"
            >
              {{ props.row.sha1.substr(0,6) }}…
            </nuxt-link>
          </b-table-column>
          <b-table-column
            v-slot="props"
            :sortable="true"
            field="earliest_calendar_date"
            label="Earliest date"
          >
            {{ props.row.earliest_calendar_date }}
          </b-table-column>
          <b-table-column
            v-slot="props"
            :sortable="true"
            field="latest_calendar_date"
            label="Latest date"
          >
            {{ props.row.latest_calendar_date }}
          </b-table-column>
          <b-table-column v-slot="props" field="feed_version_gtfs_import" label="Imported">
            <template v-if="props.row.feed_version_gtfs_import">
              <b-icon v-if="props.row.feed_version_gtfs_import.success" icon="check" />
              <b-icon v-else-if="props.row.feed_version_gtfs_import.in_progress" icon="clock" />
              <b-tooltip
                v-else-if="props.row.feed_version_gtfs_import.success == false"
                :label="props.row.feed_version_gtfs_import.exception_log"
                position="is-top"
              >
                <b-icon icon="alert" />
              </b-tooltip>
            </template>
          </b-table-column>
          <b-table-column v-slot="props" label="Active">
            <b-icon
              v-if="entity.feed_state && entity.feed_state.feed_version && entity.feed_state.feed_version.id === props.row.id"
              icon="check"
            />
          </b-table-column>
          <!-- TODO: add a link to download the feed version file using tlv2 REST API -->
        </b-table>
      </div>
    </div>
  </div>
</template>
      </b-table>
    </div>
  </div>
</template>

<script>
import EntityPageMixin from '~/components/entity-page-mixin'

export default {
  mixins: [EntityPageMixin],
  apollo: {
    query: {
      query: require('~/graphql/current-feed.gql'),
      variables () {
        return {
          feed_onestop_id: this.onestopId
        }
      }
    }
  },
  data () {
    return {
      error: 'ok',
      tabIndex: {
        0: 'versions',
        1: 'operators'
      }
    }
  },
  computed: {
    newLink () {
      return ''
    },
    editLink () {
      return `https://github.com/transitland/transitland-atlas/edit/master/feeds/${this.entity.file}`
    },
    onestopId () {
      return this.$route.params.feed
    }
  },
  head () {
    const meta = []
    if (this.entity) {
      meta.push({
        hid: 'description',
        name: 'description',
        content: `${this.onestopId} is a ${this.entity.spec.toUpperCase()} feed registered on the Transitland open data platform.`
      })
    }
    return {
      title: `${this.onestopId} • Feed details`,
      meta
    }
  }
}
</script>
