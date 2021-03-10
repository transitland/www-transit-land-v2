<template>
  <div class="outer">
    <tlnav />

    <div class="main" style="flex:1">
      <div class="container">
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
  flex:1;
  padding-top: 2em;
}
</style>
