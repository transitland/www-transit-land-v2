<template>
  <div>
    <tlnav />
    <section class="main-content columns">
      <div class="container column is-10" style="margin-top:20px">
        <nuxt />
      </div>
    </section>
    <tlfooter />
  </div>
</template>

<script>
import tlnav from '~/components/tlnav'
import tlfooter from '~/components/tlfooter'

export default {
  components: { tlnav, tlfooter }
}
</script>
