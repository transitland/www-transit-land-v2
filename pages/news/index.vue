<template>
  <div>
    <div class="content">
      <h1 class="title is-1">
        News & Updates
      </h1>
      <b-notification class="is-link" :closable="false">
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
        </span>
      </div>
    </div>
  </div>
</template>

<script>
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
      return this.articles
        .filter((s) => { return s.published === true })
        .map((s) => {
          const split = s.slug.split('-')
          let year = 0; let month = 0; let day = 0; let slug = ''
          if (split.length > 0) {
            year = split[0]
          }
          if (split.length > 1) {
            month = split[1]
          }
          if (split.length > 2) {
            day = split[2]
          }
          if (split.length > 3) {
            slug = split.slice(3).join('-')
          }
          return {
            title: s.title,
            path: s.path,
            body: s.body,
            year,
            month,
            day,
            slug
          }
        })
    }
  }
}
</script>
