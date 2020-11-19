<template>
  <div class="outer">
    <tlnav />

    <div class="main" style="flex:1">
      <nuxt />
    </div>
    <simple-analytics />
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
  height: calc(100vh - 60px);
  background:white;
  flex-grow:2;
}
</style>
