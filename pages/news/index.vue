<template>
  <div class="container">
    <div class="content">
      <h1 class="title is-1">
        News & Updates
      </h1>
      <b-notification class="is-info" :closable="false">
        <p>For shorter and more frequent updates, see also <a href="https://twitter.com/transitland">@transitland</a> on Twitter.</p>
      </b-notification>
      <div v-for="article in filteredArticles" :key="article.slug">
        <span style="display:inline-block;width:120px"> {{ article.year }} / {{ article.month }} / {{ article.day }}</span>
        <nuxt-link
          :to="{name:'news-year-month-day-slug', params:{year:article.year,month:article.month,day:article.day,slug:article.slug}}"
        >
          {{
            article.title || article.slug
          }}
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
import { filterPosts } from '~/plugins/nuxt-content-helpers'
export default {
  async asyncData ({ $content, params }) {
    const articles = await $content('news')
      .only(['title', 'published', 'slug'])
      .sortBy('slug', 'desc')
      .fetch()
    return {
      articles
    }
  },
  computed: {
    filteredArticles () {
      return filterPosts(this.articles)
    }
  }
}
</script>
