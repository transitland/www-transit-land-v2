<template>
  <div class="hero is-medium">
    <div class="hero-head">
      <tlnav />
    </div>

    <div class="main">
      <div class="container section">
        <nuxt />
      </div>
    </div>
    <simple-analytics />

    <div class="hero-foot">
      <tlfooter />
    </div>
  </div>
</template>

<script>
import tlnav from '~/components/tlnav'
import tlfooter from '~/components/tlfooter'
import simpleAnalytics from '~/components/simple-analytics'

export default {
  components: { tlnav, tlfooter, simpleAnalytics }
}
</script>

<style scoped>
.hero-head {
  background: #efefef;
}
.hero-foot {
  background:#efefef;
}
.hero {
  height:100vh
}
.main {
  background:white;
  flex-grow:2;
}
</style>
