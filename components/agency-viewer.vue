<template>
  <div>
    <b-message v-if="error" class="is-danger">
      {{ error }}
    </b-message>
    <b-table
      :loading="$apollo.loading"
      :data="entityPage"
      :striped="true"
      :paginated="true"
      :per-page="perPage"
      :total="total"
      sort-icon="menu-up"
      backend-pagination
      backend-sorting
      backend-filtering
      @page-change="onPageChange"
      @sort="onSort"
    >
      <b-table-column v-slot="props" field="agency_id" label="Agency ID">
        <nuxt-link
          :to="{name:'data-feed-versions-version-agencies-agency', params:{feed:props.row.feed_version.current_feed.onestop_id, version:props.row.feed_version.sha1, agency:props.row.agency_id}}"
        >
          {{ props.row.agency_id }}
        </nuxt-link>
      </b-table-column>
      <b-table-column
        v-slot="props"
        field="agency_name"
        label="Name"
      >
        {{ props.row.agency_name }}
      </b-table-column>
      <b-table-column v-slot="props" field="agency_url" label="URL">
        <a v-if="props.row.agency_url" :href="props.row.agency_url">
          <b-icon icon="link" />
        </a>
      </b-table-column>
    </b-table>
  </div>
</template>

<script>
import TableViewerMixin from '~/components/table-viewer-mixin'

export default {
  mixins: [TableViewerMixin],
  props: {
    fvid: { type: String, default () { return '' } }
  },
  data () {
    return {
      sortField: 'agency_id',
      sortOrder: 'asc'
    }
  },
  apollo: {
    q: {
      query: require('~/graphql/feed-agencies.gql'),
      variables () {
        return {
          feed_version_sha1: this.fvid,
          offset: this.entityOffset,
          limit: this.limit
        }
      },
      error (e) { this.error = e },
      update (data) {
        this.total = data.total.aggregate.count
        this.entities = data.entities
      }
    }
  }
}
</script>
