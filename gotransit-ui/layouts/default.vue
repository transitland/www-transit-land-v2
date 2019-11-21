<template>
  <div>
    <tlnav />
    <section class="main-content columns">
      <div class="container column is-10">
        <nuxt />
      </div>
    </section>
  </div>
</template>

<script>
import tlnav from '~/components/tlnav'

export default {
  components: { tlnav }
}
</script>
