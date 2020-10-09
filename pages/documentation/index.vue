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
import mermaid from 'mermaid'

export default {
  async asyncData ({ $content }) {
    const index = await $content('docs/index').fetch()
    return {
      index
    }
  },
  mounted () {
    mermaid.init({
      flowchart: {
        useMaxWidth: true
      }
    }, '.mermaid')
  },
  head: {
    title: 'Documentation'
  }
}
</script>

<style scoped>
.mermaid {
  width: 100%;
  height: 500px;
}
.mermaid > svg {
    max-width: 100% !important;
}
</style>
