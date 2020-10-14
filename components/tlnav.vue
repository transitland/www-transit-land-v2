<template>
  <nav class="navbar has-shadow" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <nuxt-link class="navbar-item" :to="{name:'index'}">
        <div class="logo-image" />
      </nuxt-link>
    </div>
    <div class="navbar-menu">
      <div v-for="(item,key) in items" :key="key" class="navbar-item" :class="($route && $route.name && $route.name.startsWith(item.to.name)) ? 'is-active is-tab': ''">
        <nuxt-link :to="item.to">
          {{ item.title }}
        </nuxt-link>
      </div>
      <div class="navbar-end">
        <div class="navbar-item">
          <div class="notification is-warning content is-small">
            Welcome to <strong>Transitland v2</strong>! We're in the process of migrating content from <a href="https://v1.transit.land">Transitland v1</a>.
          </div>
        </div>
        <!-- <div class="navbar-item">
          <a href="#TODO" class="button">
            <span class="icon">
              <b-icon icon="help-box" />
            </span>
            <span>Help</span>
          </a>
        </div> -->
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  data () {
    return {
      apikey: null,
      openLogin: false,
      items: [
        {
          title: 'Home',
          icon: 'home',
          to: { name: 'index' }
        },
        {
          title: 'Map',
          icon: 'lightbulb',
          to: { name: 'map' }
        },
        {
          title: 'Operators',
          icon: 'lightbulb',
          to: { name: 'operators' }
        },
        {
          title: 'Source Feeds',
          icon: 'lightbulb',
          to: { name: 'feeds' }
        },
        // {
        //   title: 'API',
        //   icon: 'lightbulb',
        //   to: { name: 'api-console' }
        // },
        {
          title: 'Documentation',
          icon: 'lightbulb',
          to: { name: 'documentation' }
        },
        {
          title: 'News & Updates',
          icon: 'lightbulb',
          to: { name: 'news' }
        }

      ]
    }
  },
  methods: {
    login (apikey) {
      localStorage.setItem('apikey', apikey)
      location.reload()
    },
    logout () {
      localStorage.removeItem('apikey')
      location.reload()
    }
  }
}
</script>

<style scoped>
.navbar {
  background:#f9f9f9;
}
a {
  color: #000;
}
.logo-image {
    background: url('~assets/transitland_logo.svg');
    background-size: contain;
    background-repeat: no-repeat;
    margin-left:20px;
    margin-right:20px;
    width: 80px;
    height: 40px;
}
.notification {
  padding: 0.6em;
}
</style>
