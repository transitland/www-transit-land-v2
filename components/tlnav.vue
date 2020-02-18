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
          title: 'Atlas',
          icon: 'lightbulb',
          to: { name: 'atlas' }
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

</style>
