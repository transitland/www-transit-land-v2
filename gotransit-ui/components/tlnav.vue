<template>
  <b-navbar :fixedTop="fixedTop" class="navbar has-shadow is-light" role="navigation" aria-label="main navigation">
    <template slot="brand">
      <a class="navbar-item" href="/">
        <div class="logo-image" />
      </a>

      <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </a>
    </template>

    <template slot="start">
      <b-navbar-item v-for="(item,key) in items" :key="key">
        <nuxt-link :to="item.to">
          {{ item.title }}
        </nuxt-link>
      </b-navbar-item>

      <b-navbar-dropdown label="Info">
        <b-navbar-item href="#">
          About
        </b-navbar-item>
        <b-navbar-item href="#">
          Contact
        </b-navbar-item>
      </b-navbar-dropdown>
    </template>
  </b-navbar>
</template>

<script>
export default {
  props: ['fixedTop'],
  data () {
    return {
      items: [
        {
          title: 'Home',
          icon: 'home',
          to: { name: 'index' }
        },
        {
          title: 'Feeds',
          icon: 'lightbulb',
          to: '/feeds'
        },
        {
          title: 'Agencies',
          icon: 'lightbulb',
          to: { name: 'agencies' }
        },
        {
          title: 'Stops',
          icon: 'lightbulb',
          to: { name: 'stops' }
        }
      ]
    }
  }
}
</script>
