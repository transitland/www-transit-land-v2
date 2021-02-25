<template>
  <div>
    <h2 class="title is-2">
      Search Transitland
    </h2>
    <b-input
      v-model="search"
      placeholder="Search"
      icon="magnify"
      expanded
      :icon-right="(search && search.length) > 0 ? 'close-circle' : null"
      icon-right-clickable
      @input="getAsyncData"
      @icon-right-click="clearSearch"
      @keydown.esc.native="clearSearch"
    />

    <br>

    <b-table
      :loading="$apollo.loading"
      :data="data"
      :striped="true"
    >
      <b-table-column v-slot="props" field="type" label="Type">
        {{ props.row.type }}
      </b-table-column>
      <b-table-column
        v-slot="props"
        field="id"
        label="Entity"
      >
        <nuxt-link :to="props.row.link">
          {{ props.row.name }}
        </nuxt-link>
      </b-table-column>
    </b-table>
  </div>
</template>

<script>
import SearchBarMixin from '~/components/search-bar-mixin.js'
export default {
  mixins: [SearchBarMixin],
  watch: {
    search (v) {
      this.$router.replace({ query: { ...this.$route.query, q: v || '' } })
    }
  },
  mounted () {
    this.search = this.$route.query.q || ''
    this.getAsyncData(this.search)
  },
  head () {
    return {
      title: 'Search'
    }
  }
}
</script>
