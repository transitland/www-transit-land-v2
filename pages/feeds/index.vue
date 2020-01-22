<template>
  <div>
    <h1 class="title">
      {{ feeds.length }} Feeds
    </h1>

    <div>
      Feeds Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis pariatur suscipit necessitatibus corrupti. Doloremque natus aperiam nisi veritatis vero enim. Omnis voluptates qui natus, fugit expedita impedit laboriosam sunt iste. Lorem ipsum dolor, sit amet consectetur adipisicing elit. Et, totam modi numquam facilis accusamus delectus. Corrupti ab dignissimos quaerat accusantium provident debitis nisi dolore quam libero, alias aspernatur quidem repellat.
    </div><br>

    <b-table
      :data="feeds"
      :striped="true"
      :paginated="true"
      :pagination-simple="true"
      pagination-position="top"
      sort-icon="menu-up"
    >
      <template slot-scope="props">
        <b-table-column :sortable="true" field="onestop_id" label="ID">
          <nuxt-link :to="{name: 'feeds-feed', params: {feed: props.row.onestop_id}}">
            {{ props.row.onestop_id }}
          </nuxt-link>
        </b-table-column>

        <b-table-column :sortable="true" :width="60" numeric field="feed_version_count" label="Versions">
          {{ props.row.feed_version_count }}
        </b-table-column>

        <b-table-column :sortable="true" :width="150" field="last_successful_fetch_at" label="Fetched">
          <span v-if="props.row.last_successful_fetch_at">
            {{ props.row.last_successful_fetch_at | moment("from","now") }}
          </span>
          <span v-else>Never</span>
        </b-table-column>

        <b-table-column :sortable="true" :width="60" field="last_fetch_error" label="">
          <b-tooltip :label="props.row.last_fetch_error">
            <b-icon v-if="props.row.last_fetch_error" icon="alert" />
          </b-tooltip>
        </b-table-column>

        <b-table-column :sortable="true" :width="150" field="last_successful_import_at" label="Imported">
          <span v-if="props.row.last_successful_import_at">
            {{ props.row.last_successful_import_at | moment("from","now") }}
          </span>
          <span v-else>Never</span>
        </b-table-column>

        <b-table-column :sortable="true" :width="60" field="last_import_fail" label=" ">
          <b-tooltip :label="props.row.last_import_fail">
            <b-icon v-if="props.row.last_import_fail" icon="alert" />
          </b-tooltip>
        </b-table-column>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  computed: {
    feeds () {
      return this.current_feeds.map((feed) => {
        const feedState = feed.feed_state || {}
        const currentFeedVersion = feedState.feed_version || {}
        const currentImport = (currentFeedVersion && currentFeedVersion.feed_version_gtfs_import) || {}
        const lastFailedFeedVersion = ((feed.import_errors || [{}])[0]) || {}
        let lastImportFail = null
        if (lastFailedFeedVersion.id > (currentFeedVersion.id || 0)) {
          lastImportFail = lastFailedFeedVersion.feed_version_gtfs_import.exception_log
        }
        return {
          onestop_id: feed.onestop_id,
          last_fetched_at: feedState.last_fetched_at,
          last_fetch_error: feedState.last_fetch_error,
          last_successful_fetch_at: feedState.last_successful_fetch_at,
          last_successful_import_at: currentImport.created_at,
          last_import_fail: lastImportFail,
          feed_version_count: feed.feed_versions_aggregate.aggregate.count
        }
      })
    }
  },
  asyncData (context) {
    const client = context.app.apolloProvider.defaultClient
    return client.query({
      query: require('~/graphql/current_feeds.gql')
    }).then(({ data }) => {
      return data
    })
  }
}
</script>
