<template>
  <div>
    <h1 class="title">
      Transitland Source Feeds
    </h1>

    <div class="content is-medium">
      <p>These feeds are the raw data sources aggregated and processed by Transitland. This list is regularly synced from GitHub, where it lives as a series of <abbr title="Distributed Mobility Feed Registry">DMFR</abbr> files in the <a href="https://github.com/transitland/transitland-atlas">Transitland Atlas repository</a>. Edits and additions to the repo are welcome.</p>
      <p>GTFS feeds are checked at least once per day, and a feed version record is created each time a new or updated file is found. If the request fails or produces invalid data, the error is noted and an exception icon appears in the fetched column. Newly discovered feed versions are immediately imported into the Transitland Datastore.</p>
      <p>GTFS-RT feeds are cataloged with URLs for clients to query using your own tools.</p>
      <p>
        Transitland provides additional metadata and grouped related feeds using
        <nuxt-link :to="{name:'operators'}">
          operators
        </nuxt-link>.
      </p>
    </div>

    <feed-viewer />

    <div style="margin-top:40px">
      <b-message type="is-info">
        <div>
          Know a feed that's missing? <a href="https://github.com/transitland/transitland-atlas/blob/master/README.md#how-to-add-a-new-feed" class="button" style="float:right">Add a feed to Transitland Atlas</a>
        </div>
      </b-message>
    </div>
  </div>
</template>

<script>
export default {
  head () {
    return {
      title: 'Browse all GTFS and GTFS-RT Feeds'
    }
  }
}
</script>
