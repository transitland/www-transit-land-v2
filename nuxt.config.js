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
  ssr: true,
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
  publicRuntimeConfig: {
    graphqlEndpoint: process.env.GRAPHQL_ENDPOINT || 'https://transit.land/api/v2/query',
    graphqlApikey: process.env.GRAPHQL_APIKEY || '',
    graphqlServerReferer: process.env.GRAPHQL_SERVER_REFERER || '',
    tileEndpoint: process.env.TILE_ENDPOINT || 'https://transit.land/api/v2/tiles',
    tileApikey: process.env.TILE_APIKEY || ''
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
  styleResources: {
    scss: '~/assets/vars/*.scss'
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
    '@nuxtjs/eslint-module',
    // https://github.com/nuxt-community/style-resources-module
    '@nuxtjs/style-resources',
    '@nuxtjs/google-fonts'
  ],
  googleFonts: {
    families: {
      Lato: true,
      Raleway: true
    },
    download: true
  },
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
    '@nuxtjs/robots',
    '@nuxtjs/redirect-module'
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
      default: '~/plugins/apollo.js'
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
  generate: {
    // NOTE: we handle these redirects in the Nginx containers that serve https://www.transit.land
    exclude: ['/documentation/glossary', '/playground', '/feed-registry', '/an-open-project', '/feed-registry/feeds/new']
  },
  redirect: [
    { from: '^/feed-registry/operators/(.*)$', to: '/operators/$1', status: 301 },
    { from: '^/feed-registry/feeds/new', to: '/documentation/atlas', status: 301 },
    { from: '^/feed-registry', to: '/operators', status: 301 },
    { from: '^/dispatcher/feeds/(.*)$', to: '/feeds/$1', status: 301 },
    { from: '^/dispatcher/feeds', to: '/feeds', status: 301 },
    { from: '^/dispatcher/operators/(.*)$', to: '/operators/$1', status: 301 },
    { from: '^/dispatcher/operators', to: '/operators', status: 301 },
    { from: '^/dispatcher/feed-versions/(.*)$', to: '/feed-versions/$1', status: 301 },
    { from: '^/dispatcher', to: '/documentation/dispatcher', status: 302 },
    { from: '^/how-it-works', to: '/documentation', status: 301 },
    { from: '^/an-open-project/contributor-agreement.html', to: '/documentation/an-open-project/contributor-agreement', status: 301 },
    { from: '^/an-open-project/transitland-model-license.docx', to: '/transitland-model-license.docx', status: 302 },
    { from: '^/an-open-project', to: '/documentation/an-open-project', status: 301 },
    { from: '^/playground', to: '/map', status: 301 },
    { from: '^/participate', to: '/documentation/#how-to-participate', status: 301 },
    { from: '^/documentation/tutorials/(.*)$', to: 'https://v1.transit.land/documentation/tutorials/$1', status: 302 },
    { from: '^/documentation/glossary', to: 'https://v1.transit.land/documentation/glossary', status: 302 },
    { from: '^/documentation/feed-registry/(.*)$', to: 'https://v1.transit.land/documentation/feed-registry/$1', status: 302 },
    { from: '^/rss.xml', to: '/feed.xml', status: 301 }
  ],
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extractCSS: true
  }
}
