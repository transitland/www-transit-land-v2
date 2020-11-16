// RSS feed
const create = async (feed, args) => {
  feed.options = {
    title: 'Transitland',
    link: 'https://www.transit.land/feed.xml',
    description: 'News and updates from Transitland, an open platform aggregating data from thousands of transit providers throughout the world using GTFS, GTFS Realtime, and related open data feeds.'
  }
  const { $content } = require('@nuxt/content')
  const posts = await $content('news')
    .only(['title', 'published', 'slug'])
    .sortBy('slug', 'desc')
    .fetch()

  // TODO: import this code from nuxt-content-helpers.js
  posts
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
    }).forEach((post) => {
      const link = `https://www.transit.land/news/${post.year}/${post.month}/${post.day}/${post.slug}`
      const date = new Date(post.year, post.month, post.day)
      feed.addItem({
        title: post.title,
        id: post.slug,
        link,
        date
      })
    })
}

export default {
  ssr: false,
  // https://github.com/nuxt/components
  components: true,
  server: {
    port: 3000, // default: 3000
    host: '0.0.0.0', // default: localhost,
    timing: false
  },
  /*
  ** Headers of the page
  */
  head: {
    titleTemplate: '%s • Transitland',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Transitland is a community-edited edited open data service aggregating transit networks across metropolitan and rural arounds around the world. Transitland collects over a thousand GTFS and GTFS Realtime feeds from over 50 countries. Transitland provides an API and other ways to explore and use transit data.' },
      { name: 'msapplication-TileColor', content: '#da532c' },
      { name: 'theme-color', content: '#ffffff' }
    ],
    link: [
      { rel: 'stylesheet', href: 'https://api.tiles.mapbox.com/mapbox-gl-js/v1.6.1/mapbox-gl.css' },
      { rel: 'alternate', type: 'application/rss+xml', title: 'Transitland News', href: '/feed.xml' },
      // created using https://realfavicongenerator.net
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'manifest', href: '/site.webmanifest' },
      { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#c1c1c1' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: {
    color: 'blue',
    height: '5px'
  },
  env: {
    tileEndpoint: process.env.TILE_ENDPOINT,
    tileApikey: process.env.TILE_APIKEY,
    graphqlEndpoint: process.env.GRAPHQL_ENDPOINT,
    graphqlApikey: process.env.GRAPHQL_APIKEY
  },
  /*
  ** Global CSS
  */
  css: [
    '@/assets/main.scss'
  ],
  router: {
    linkActiveClass: 'is-active'
  },
  /*
  ** Plugins to load before mounting the App
  */
  plugins: ['~/plugins/global.js'],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://buefy.github.io/#/documentation
    'nuxt-buefy',
    // https://github.com/nuxt-community/apollo-module
    '@nuxtjs/apollo',
    // https://content.nuxtjs.org/
    '@nuxt/content',
    '@nuxtjs/feed',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots'
  ],
  content: {
    liveEdit: false,
    markdown: {
      rehypePlugins: [
        ['rehype-wrap', {
          selector: 'table',
          wrapper: 'div.table-container'
        }],
        ['rehype-add-classes', {
          'h1,h2,h3,h4,h5': 'title',
          h1: 'is-1',
          h2: 'is-2',
          h3: 'is-3',
          h4: 'is-4',
          h5: 'is-5',
          table: 'table is-striped',
          p: 'content'
        }]
      ]
    }
  },
  /* APOLLO */
  apollo: {
    clientConfigs: {
      default: {
        httpEndpoint: process.env.GRAPHQL_ENDPOINT,
        httpLinkOptions: {
          credentials: 'same-origin',
          headers: {
            apikey: process.env.GRAPHQL_APIKEY
          }
        }
      }
    }
  },
  sitemap: {
    hostname: 'https://www.transit.land',
    gzip: true,
    exclude: []
    // TODO: add docs and/or news pages
  },
  robots: [
    {
      UserAgent: '*',
      Allow: '/',
      Sitemap: 'https://www.transit.land/sitemap.xml'
    }
  ],
  feed: [
    {
      path: '/feed.xml',
      create,
      cacheTime: 1000 * 60 * 15,
      type: 'rss2',
      data: []
    }
  ],
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
  }
}
