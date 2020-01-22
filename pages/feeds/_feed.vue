<template>
  <div>
    <h2 class="subtitle">
      Feeds
    </h2>
    <h1 class="title">
      {{ feed.onestop_id }}
    </h1>

    <div>URLs: {{ feed.urls }}</div>
    <div>Authorization: {{ feed.authorization }}</div>
    <div>License: {{ feed.license }}</div>
    <div>Languages: {{ feed.languages }}</div>
    <div>Other IDs: {{ feed.other_ids }}</div>

    <b-table
      :data="feed.feed_versions"
      :striped="true"
      :paginated="true"
      :pagination-simple="true"
      pagination-position="top"
      sort-icon="menu-up"
    >
      <template slot-scope="props">
        <b-table-column :sortable="true" field="fetched_at" label="Fetched">
          {{ props.row.fetched_at | moment("from","now") }}
        </b-table-column>
        <b-table-column :sortable="true" field="sha1" label="SHA1">
          {{ props.row.sha1.substr(0,8) }}
        </b-table-column>
        <b-table-column :sortable="true" field="earliest_calendar_date" label="Earliest date">
          {{ props.row.earliest_calendar_date }}
        </b-table-column>
        <b-table-column :sortable="true" field="latest_calendar_date" label="Latest date">
          {{ props.row.latest_calendar_date }}
        </b-table-column>
        <b-table-column field="feed_version_gtfs_import" label="Imported">
          <template v-if="props.row.feed_version_gtfs_import">
            <b-icon v-if="props.row.feed_version_gtfs_import.success" icon="check" />
            <b-icon v-else-if="props.row.feed_version_gtfs_import.in_progress" icon="clock" />
            <b-tooltip v-else-if="props.row.feed_version_gtfs_import.success == false" :label="props.row.feed_version_gtfs_import.exception_log" position="is-top">
              <b-icon icon="alert" />
            </b-tooltip>
          </template>
        </b-table-column>
        <b-table-column label="Active">
          <b-icon v-if="feed.feed_state && feed.feed_state.feed_version && feed.feed_state.feed_version.id === props.row.id" icon="check" />
        </b-table-column>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  computed: {
    feed () {
      return this.current_feeds[0]
    }
  },
  asyncData (context) {
    const client = context.app.apolloProvider.defaultClient
    return client.query({
      query: require('~/graphql/current_feed.gql'),
      variables: {
        feed_onestop_id: context.route.params.feed
      }
    }).then(({ data }) => {
      return data
    })
  }

}
</script>
