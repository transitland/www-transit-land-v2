<template>
  <div>
    <tlnav />
    <section class="main-content columns">
      <div class="container column is-10" style="margin-top:20px">
        <nuxt />
      </div>
    </section>
    <tlfooter />
    <simple-analytics />
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
