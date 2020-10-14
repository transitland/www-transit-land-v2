<template>
  <div>
    <h1 class="title is-2">
      News & Updates
    </h1>
    <!-- TODO: query @nuxt/content for blog posts -->
    <p class="content is-medium">
      For updates on Transitland, see <a href="https://v1.transit.land/news/">See the blog on Transitland v1</a> and <a href="https://twitter.com/transitland">@transitland on Twitter</a>.
    </p>
    <hr>
    <a class="twitter-timeline" data-dnt="true" data-theme="dark" href="https://twitter.com/transitland?ref_src=twsrc%5Etfw">Tweets by transitland</a> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8" />
  </div>
</template>

<script>
export default {
  head: {
    title: 'News & Updates'
  }
}
</script>
