<template>
  <div>
    <h1 class="title">
      Transitland Operators
    </h1>

    <div class="content is-medium">
      <p>
        Transitland uses operators to group together <nuxt-link :to="{name:'data'}">
          source feeds
        </nuxt-link> and other relevant data. This table can be searched and sorted; click on an operator name to drill down for more information.
      </p>
    </div>

    <operator-viewer />

    <div>
      <b-message type="is-info">
        <div>
          Know an operator that's missing? <a href="https://github.com/transitland/transitland-atlas/blob/master/README.md#how-to-add-a-new-feed" class="button" style="float:right">Add an operator to Transitland Atlas</a>
        </div>
      </b-message>
    </div>
  </div>
</template>

<script>
export default {
  head () {
    return {
      title: 'Browse all Operators'
    }
  }
}
</script>
