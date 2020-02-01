<template>
  <b-navbar class="navbar has-shadow is-light" role="navigation" aria-label="main navigation">
    <template slot="brand">
      <a class="navbar-item" href="/">
        <div class="logo-image" />
      </a>
    </template>

    <template slot="start">
      <b-navbar-item v-for="(item,key) in items" :key="key">
        <nuxt-link :to="item.to">
          {{ item.title }}
        </nuxt-link>
      </b-navbar-item>

      <b-navbar-item href="#">
        About
      </b-navbar-item>

      <b-navbar-item href="#">
        Contact
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
          title: 'Atlas',
          icon: 'lightbulb',
          to: '/feeds'
        },
        {
          title: 'Operators',
          icon: 'lightbulb',
          to: '/operators'
        }
      ]
    }
  }
}
</script>
