<template>
  <div>
    <nav class="breadcrumb">
      <ul>
        <li>
          <nuxt-link :to="{name:'news'}">
            News & Updates
          </nuxt-link>
        </li>
        <li>
          <a href="#">{{ article.title }}</a>
        </li>
      </ul>
    </nav>

    <div class="content">
      <h1 class="is-1 title">
        {{ article.title }}
      </h1>
      <h4 class="subtitle is-4">
        Published {{ $route.params.year }}-{{ $route.params.month }}-{{ $route.params.day }}
      </h4>
      <nuxt-content :document="article" />
    </div>
  </div>
</template>

<script>
export default {
  async asyncData ({ $content, params }) {
    const fn = `${params.year}-${params.month}-${params.day}-${params.slug.replace('.html', '')}`
    const article = await $content('news', fn).fetch()
    if (!article.published) {
      return {}
    }
    return { article }
  },
  head () {
    return {
      title: this.article.title
    }
  }
}
</script>
