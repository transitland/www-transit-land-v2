<template>
  <div>
    <tlnav />
    <section class="main-content">
      <nuxt />
    </section>
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
