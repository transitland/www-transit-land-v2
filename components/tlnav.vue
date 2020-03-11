<template>
  <b-navbar class="has-shadow is-light" aria-label="main navigation" fixed-top>
    <template slot="brand">
      <a class="navbar-item" href="/">
        <div class="logo-image" />
      </a>
    </template>

    <template slot="start">
      <b-navbar-item v-for="(item,key) in items" :key="key" :active="$route.path.startsWith(item.to)">
        <nuxt-link :to="item.to">
          {{ item.title }}
        </nuxt-link>
      </b-navbar-item>
    </template>

    <template slot="end">
      <b-navbar-item>
        <div class="notification is-warning content is-small">
          Welcome to <strong>Transitland v2</strong>! We're in the process of migrating content from <a href="https://transit.land">Transitland v1</a>.
        </div>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script>
export default {
  data () {
    return {
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
          to: '/operators'
        },
        {
          title: 'Feeds',
          icon: 'lightbulb',
          to: '/feeds'
        },
        {
          title: 'API Console',
          icon: 'lightbulb',
          to: '/api-console'
        },
        {
          title: 'Docs',
          icon: 'lightbulb',
          to: '/documentation'
        },
        {
          title: 'News',
          icon: 'lightbulb',
          to: '/news'
        }

      ]
    }
  }
}
</script>

<style scoped>
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
