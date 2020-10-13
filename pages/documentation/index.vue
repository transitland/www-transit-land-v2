<template>
  <div class="content">
    <h1 class="is-1 title">
      Documentation
    </h1>
    <ul>
      <li
        v-for="link of index.toc"
        :key="link.id"
        :class="{ 'toc2': link.depth === 2, 'toc3': link.depth === 3 }"
      >
        <NuxtLink :to="`#${link.id}`">
          {{ link.text }}
        </NuxtLink>
      </li>
    </ul>
    <nuxt-content :document="index" />
  </div>
</template>

<script>
export default {
  async asyncData ({ $content }) {
    const index = await $content('docs/index').fetch()
    return {
      index
    }
  },
  head: {
    title: 'Documentation'
  }
}
</script>

<style scoped>
h1,h2,h3,h4,h5 {
  float: none; /* for some reason @nuxt/content adds inline style tag */
}
</style>
