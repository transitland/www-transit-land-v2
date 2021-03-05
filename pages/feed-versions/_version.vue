<template>
  <div class="container">
    <h2 class="title is-2 is-centered">
      Find a GTFS feed version by hash
    </h2>
    <b-message :class="error ? 'is-warning' : 'is-info'">
      <p v-if="error">
        Sorry, we're not able to find a feed version with this hash in Transitland's archive. Try browsing the <a href="/feeds/">full feed index</a>.
      </p>
      <p v-else>
        Transitland contains an archive of tens of thousands of GTFS feed versions. This webpage is looking up this feed version by its SHA1 hash and will redirect you shortly, if it is found.
      </p>
    </b-message>
  </div>
</template>

<script>
import gql from 'graphql-tag'

const q = gql`
query ($feed_version_sha1: String!) {
  entities: feed_versions(limit: 1, where: {sha1: $feed_version_sha1}) {
    id
    sha1
    feed {
      onestop_id
    }
  }
}
`

export default {
  data () {
    return {
      error: null
    }
  },
  apollo: {
    entities: {
      query: q,
      variables () {
        return {
          feed_version_sha1: this.$route.params.version
        }
      }
    }
  },
  watch: {
    entities () {
      if (this.entities.length > 0) {
        this.$router.push({
          name: 'feeds-feed-versions-version',
          params: {
            feed: this.entities[0].feed.onestop_id,
            version: this.entities[0].sha1
          }
        })
      } else {
        this.error = true
      }
    }
  }
}
</script>
