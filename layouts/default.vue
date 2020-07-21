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
import tlnav from '~/components/tlnav'
import tlfooter from '~/components/tlfooter'
import simpleAnalytics from '~/components/simple-analytics'

export default {
  components: { tlnav, tlfooter, simpleAnalytics }
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
