<template>
  <div class="content">
    <h1 class="is-1 title">
      News
    </h1>
    slug: {{ $route.params.slug }}
    <nuxt-content :document="article" />
  </div>
</template>

<script>
export default {
  async asyncData ({ $content, params }) {
    console.log('params:', params)
    const article = await $content('news', params.slug).fetch()
    return { article }
  }
}
</script>
