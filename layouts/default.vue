<template>
  <div>
    <tlnav />

    <div class="main">
      <nuxt />
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
.main {
  padding-top: 2em;
}
</style>
