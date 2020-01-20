<template>
  <div>
    <tlnav />
    <section class="main-content">
      <nuxt />
    </section>
  </div>
</template>

<script>
import tlnav from '~/components/tlnav'

export default {
  components: { tlnav }
}
</script>
