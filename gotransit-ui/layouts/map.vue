<template>
  <div>
    <b-navbar class="navbar has-shadow is-light" role="navigation" :fixed-top="true" aria-label="main navigation">
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

    <section class="main-content">
      <nuxt />
    </section>
  </div>
</template>

<script>
import defaultLayout from './default'

export default {
  mixins: [defaultLayout]
}
</script>
