<template>
  <div>
    <h1 class="title">
      Transitland Source Feeds
    </h1>

    <div class="content is-medium">
      <p>
        Source feeds are open data sources defined in the <nuxt-link to="/documentation/atlas">
          Transitland Atlas
        </nuxt-link> repository.
      </p>
      <p>
        Feeds are grouped by <nuxt-link :to="{name:'operators'}">
          Transitland operators
        </nuxt-link>, which provide a richer view for browsing.
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
      title: 'Source Feeds: GTFS, GTFS Realtime, GBFS',
      meta: [
        { hid: 'description', name: 'description', content: 'GTFS, GTFS Realtime, and GBFS source feeds cataloged by the Transitland platform.' }
      ]
    }
  }
}
</script>
