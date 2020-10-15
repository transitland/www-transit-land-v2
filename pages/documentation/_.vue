<template>
  <div>
    <div>
      <div class="columns">
        <div class="column is-one-quarter">
          <doc-index />
        </div>
        <div class="column is-three-quarters content">
          <h1 class="title is-1">
            {{ index.title }}
          </h1>
          <ul v-if="!index.notoc">
            <b-message v-if="index.deprecated" type="is-warning" has-icon>
              This documentation is for the deprecated Transitland v1 platform.
            </b-message>

            <li
              v-for="link of index.toc || []"
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
      </div>
    </div>
  </div>
</template>

<script>
export default {
  async asyncData ({ $content, params }) {
    let fn = params.pathMatch.replace('.html', '')
    if (fn === '') {
      fn = 'index'
    } else if (fn.slice(-1) === '/') {
      fn = fn + 'index'
    }
    const index = await $content('docs', fn).fetch()
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
