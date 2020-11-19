<template>
  <div class="outer">
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
    if (this.$route.path) {
      return {
        link: [
          {
            rel: 'canonical',
            href: 'https://www.transit.land' + this.$route.path
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
