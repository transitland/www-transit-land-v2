<template>
  <section class="section">
    <table>
      <thead>
        <th>Feed ID</th>
        <th># Versions</th>
        <th>Fetched</th>
        <th>Imported</th>
      </thead>
      <tbody>
        <tr v-for="ent in ents" :key="ent.id">
          <td>
            <router-link :to="{name: 'feeds-id', params: {id:ent.onestop_id}}">
              {{ ent.onestop_id }}
            </router-link>
          </td>
          <td> {{ ent.feed_versions.length }}</td>
          <template v-if="ent.feed_states.length > 0">
            <td>
              <template v-if="ent.feed_states[0].last_fetch_error">
                Error!
              </template>
              <template v-else>
                {{ ent.last_successful_fetch_at | moment("from") }}
              </template>
            </td>
          </template>
          <template v-if="ent.feed_states.length > 0 && ent.feed_states[0].feed_version && ent.feed_states[0].feed_version.feed_version_gtfs_imports.length > 0">
            <td>
              {{ ent.feed_states[0].feed_version.feed_version_gtfs_imports[0].created_at | moment("from") }}
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script>
import apolloProvider from '~/graphql'

export default {
  data () {
    return {
      ents: null
    }
  },
  mounted () {
    this.load()
  },
  validate ({ params }) {
    return true
  },
  methods: {
    load () {
      this.$apollo
        .query({
          query: require('~/graphql/current_feeds.gql'),
          variables: {}
        })
        .then((response) => {
          this.ents = response.data.current_feeds
        })
    }
  },
  apolloProvider
}
</script>
