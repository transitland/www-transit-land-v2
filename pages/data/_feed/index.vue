<template>
  <div>
    <b-message v-if="error" class="is-danger">
      {{ error }}
    </b-message>
    <span v-else-if="$apollo.loading" class="is-loading" />
    <div v-else>
      <nav class="breadcrumb">
        <ul>
          <li>
            <nuxt-link :to="{name:'data'}">
              Source Feeds
            </nuxt-link>
          </li>
          <li>
            <nuxt-link :to="{name: 'data-feed', params:{feed:$route.params.feed}}">
              {{ $route.params.feed }}
            </nuxt-link>
          </li>
        </ul>
      </nav>
      <h1 class="title">
        Feed details: {{ feed.onestop_id }}
      </h1>

      <table class="property-list">
        <tr>
          <td>
            <b-tooltip dashed label="A globally unique identifier for this feed">
              Onestop ID
            </b-tooltip>
          </td>
          <td>
            <nuxt-link :to="{name:'operators-onestop_id', params:{onestop_id:$route.params.operator}}">
              {{ onestopId }}
            </nuxt-link>
            <b-tooltip dashed label="Edit this Feed in Transitland Atlas">
              <a :href="editLink" target="_blank"><b-icon icon="pencil" size="is-small" /></a>
            </b-tooltip>
          </td>
        </tr>
        <tr>
          <td>Format</td>
          <td>{{ feed.spec }}</td>
        </tr>
        <tr>
          <td>URLs</td>
          <td>
            <ul>
              <li v-for="(url,key) in feed.urls" :key="key">
                {{ key }}:
                <a :href="url">{{ url }}</a>
              </li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>Authorization</td>
          <td>{{ feed.authorization }}</td>
        </tr>
        <tr>
          <td>License</td>
          <td>
            <ul>
              <li>License URL: {{ feed.license.url }}</li>
              <li>License Identifier: {{ feed.license.spdx_identifier }}</li>
              <li>
                Attribution optional:
                <span v-if="feed.license.share_alike_optional === 'yes'">Yes</span>
                <span v-else-if="feed.license.share_alike_optional === 'no'">No</span>
                <span v-else>Unknown</span>
              </li>
              <li>
                Commercial use allowed:
                <span v-if="feed.license.commercial_use_allowed === 'yes'">Yes</span>
                <span v-else-if="feed.license.commercial_use_allowed === 'no'">No</span>
                <span v-else>Unknown</span>
              </li>
              <li>
                Derivitive use allowed:
                <span v-if="feed.license.create_derived_product === 'yes'">Yes</span>
                <span v-else-if="feed.license.create_derived_product === 'no'">No</span>
                <span v-else>Unknown</span>
              </li>
              <li>Attribution instructions: {{ feed.license.attribution_instructions }}</li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>Languages</td>
          <td>{{ feed.languages }}</td>
        </tr>
        <tr>
          <td>Other IDs</td>
          <td>{{ feed.other_ids }}</td>
        </tr>
      </table>

      <b-table
        :data="feed.feed_versions"
        :striped="true"
        :paginated="true"
        :pagination-simple="true"
        pagination-position="top"
        sort-icon="menu-up"
      >
        <b-table-column
          v-slot="props"
          :sortable="true"
          field="fetched_at"
          label="Fetched"
        >
          {{ props.row.fetched_at | moment("from","now") }}
        </b-table-column>
        <b-table-column v-slot="props" :sortable="true" field="sha1" label="SHA1">
          <nuxt-link
            :to="{name: 'data-feed-versions-version', params: {feed: feed.onestop_id, version: props.row.sha1}}"
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
            v-if="feed.feed_state && feed.feed_state.feed_version && feed.feed_state.feed_version.id === props.row.id"
            icon="check"
          />
        </b-table-column>
      </b-table>
    </div>
  </div>
</template>
      </b-table>
    </div>
  </div>
</template>

<script>
export default {
  apollo: {
    entities: {
      query: require('~/graphql/current-feed.gql'),
      error (e) { this.error = e },
      variables () {
        return {
          feed_onestop_id: this.onestopId
        }
      }
    }
  },
  data () {
    return {
      entities: [],
      error: null
    }
  },
  computed: {
    editLink () {
      return `https://github.com/transitland/transitland-atlas/edit/master/feeds/${this.feed.file}`
    },
    onestopId () {
      return this.$route.params.feed
    },
    feed () {
      return (this.entities && this.entities.length > 0) ? this.entities[0] : null
    }
  },
  head () {
    const meta = []
    if (this.feed) {
      meta.push({
        hid: 'description',
        name: 'description',
        content: `${this.onestopId} is a ${this.feed.spec.toUpperCase()} feed registered on the Transitland open data platform.`
      })
    }
    return {
      title: `${this.onestopId} • Feed details`,
      meta
    }
  }
}
</script>
