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
import tlnav from '~/components/tlnav'
import simpleAnalytics from '~/components/simple-analytics'

export default {
  components: { tlnav, simpleAnalytics }
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
