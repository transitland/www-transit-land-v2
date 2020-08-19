
export default {
  mode: 'spa',
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
    '@nuxtjs/apollo'
  ],
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
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
  }
}
