<template>
  <div>
    <h1 class="title">
      Transitland Source Feeds
    </h1>

    <div class="content is-medium">
      <p>
        Source feeds are the raw data sources defined in the <nuxt-link to="/documentation/atlas">
          Transitland Atlas
        </nuxt-link>. This page is for browsing current and historical GTFS data and monitoring the fetch and import processes. The <nuxt-link to="/map">
          Map
        </nuxt-link> and <nuxt-link :to="{name:'operators'}">
          Operators
        </nuxt-link> provide a more aggregated, current, and user-friendly view of the global system.
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
