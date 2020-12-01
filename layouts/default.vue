<template>
  <div class="outer">
    <section class="hero is-danger is-light">
      <div class="hero-body">
        <div class="container">
          <strong>December 1, 2020</strong> Transitland v1 Datastore API and v2 GraphQL API are having problems today. We are working with our database vendor to resolve this unexpected error and are <a href="https://twitter.com/transitland">posting updates to Twitter</a>. Many pages on this website that are powered by the APIs may not work temporarily. In the meantime, Transitland's <a href="/map">global transit map</a> is still available to browse.
        </div>
      </div>
    </section>
    <tlnav />

    <div class="main" style="flex:1">
      <div class="container section">
        <nuxt />
      </div>
    </div>
    <simple-analytics />

    <tlfooter />
  </div>
</template>

<script>
export default {
  head () {
    let href = 'https://www.transit.land' + this.$route.path
    if (this.$route.path.endsWith('.html')) {
      // nothing
    } else if (this.$route.path.endsWith('/')) {
      // nothing
    } else {
      href += '/'
    }
    if (this.$route.path) {
      return {
        link: [
          {
            rel: 'canonical',
            href
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
.outer {
  display:flex;
  min-height:100vh;
  flex-direction:column;
}
.main {
  background:white;
  flex:1;
}
</style>
