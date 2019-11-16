<template>
  <div>
    <nav
      class="navbar header has-shadow is-light"
      role="navigation"
      aria-label="main navigation"
    >
      <div class="navbar-brand">
        <a
          class="navbar-item"
          href="/"
        >
          <div class="logo-image" />
          <h2 class="is-h2">Transitland GraphQL Demo</h2>
        </a>

        <div class="navbar-burger">
          <span />
          <span />
          <span />
        </div>
      </div>
    </nav>

    <section class="main-content columns">
      <aside class="column is-2 section">
        <p class="menu-label is-hidden-touch">
          General
        </p>
        <ul class="menu-list">
          <li
            v-for="(item, key) of items"
            :key="key"
          >
            <nuxt-link
              :to="item.to"
              exact-active-class="is-active"
            >
              <b-icon :icon="item.icon" /> {{ item.title }}
            </nuxt-link>
          </li>
        </ul>
      </aside>

      <div class="container column is-10">
        <nuxt />
      </div>
    </section>
  </div>
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
          title: 'Routes',
          icon: 'lightbulb',
          to: { name: 'routes' }
        }
      ]
    }
  }
}
</script>

<style scoped>
.logo-image {
  background: url('~assets/transitland_logo.svg');
  background-size: contain;
  background-repeat: no-repeat;
  width: 160px;
  height: 40px;
}
</style>
