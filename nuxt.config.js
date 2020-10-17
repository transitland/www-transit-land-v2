
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
      { hid: 'description', name: 'description', content: 'Transitland is a community-edited edited open data service aggregating transit networks across metropolitan and rural arounds around the world. Transitland collects over a thousand GTFS and GTFS Realtime feeds from over 50 countries. Transitland provides an API and other ways to explore and use transit data.' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://api.tiles.mapbox.com/mapbox-gl-js/v1.6.1/mapbox-gl.css' }
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
    '@nuxtjs/redirect-module',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots'
  ],
  redirect: [
    { from: '^/feed-registry/operators/(.*)$', to: '/operators/$1', status: 301 },
    { from: '^/feed-registry', to: '/operators', status: 301 },
    { from: '^/how-it-works', to: '/documentation', status: 301 },
    { from: '^/an-open-project/contributor-agreement.html', to: '/documentation/an-open-project/contributor-agreement', status: 301 },
    { from: '^/an-open-project/transitland-model-license.docx', to: '/transitland-model-license.docx', status: 302 },
    { from: '^/an-open-project', to: '/documentation/an-open-project', status: 301 },
    { from: '^/playground', to: '/map', status: 301 },
    { from: '^/documentation/tutorials/(.*)$', to: 'https://v1.transit.land/documentation/tutorials/$1', status: 302 },
    { from: '^/documentation/dispatcher', to: 'https://v1.transit.land/documentation/dispatcher', status: 302 },
    { from: '^/documentation/glossary', to: 'https://v1.transit.land/documentation/glossary', status: 302 },
    { from: '^/documentation/feed-registry/(.*)$', to: 'https://v1.transit.land/documentation/feed-registry/$1', status: 302 }
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
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
  }
}
