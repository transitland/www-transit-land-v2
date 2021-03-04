<template>
  <div class="container">
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
    const meta = [
      { hid: 'og:title', property: 'og:title', content: this.article.title },
      { hid: 'twitter:title', name: 'twitter:title', content: this.article.title },
      { hid: 'twitter:site', name: 'twitter:site', content: '@transitland' }
    ]
    if (this.article.description) {
      meta.push({ hid: 'twitter:description', name: 'twitter:description', content: this.article.description })
      meta.push({ hid: 'description', name: 'description', content: this.article.description })
      meta.push({ hid: 'og:description', property: 'og:description', content: this.article.description })
    }
    if (this.article.previewImagePath) {
      meta.push({ hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' })
      meta.push({ hid: 'twitter:image', name: 'twitter:image', content: this.article.previewImagePath }) // TODO: a function for adding the hostname
    } else {
      meta.push({ hid: 'twitter:card', name: 'twitter:card', content: 'summary' })
      meta.push({ hid: 'twitter:image', name: 'twitter:image', content: 'https://www.transit.land/images/transitland_logo@2x.png' }) // TODO: a function for adding the hostname
    }

    return {
      title: this.article.title,
      meta
    }
  }
}
</script>
