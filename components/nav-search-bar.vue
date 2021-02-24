<template>
  <b-field expanded>
    <b-autocomplete
      v-model="search"
      expanded
      :data="data"
      max-height="600px"
      placeholder="Search"
      :loading="isFetching"
      :clearable="true"
      icon="magnify"
      @focus="$emit('focus')"
      @typing="getAsyncData"
      @select="option => selected = option"
      @keydown.esc.native="clearSearch"
    >
      <template slot-scope="props">
        {{ props.option.name }}
        <span class="is-pulled-right" style="color:#ccc">{{ props.option.type }}</span>
      </template>
    </b-autocomplete>
    <span class="button" @click="goToSearch">Go</span>
  </b-field>
</template>

<script>
import SearchBarMixin from '~/components/search-bar-mixin.js'
export default {
  mixins: [SearchBarMixin],
  data () {
    return {
      selected: null
    }
  },
  watch: {
    selected () {
      this.$emit('blur')
      const key = this.selected ? this.selected.type : null
      const ent = this.selected.entity
      if (!key) {
        return
      }
      if (key === 'Feed') {
        this.$router.push({ name: 'feeds-feed', params: { feed: ent.onestop_id } })
      } else if (key === 'Operator') {
        this.$router.push({ name: 'operators-onestop_id', params: { onestop_id: ent.onestop_id } })
      } else if (key === 'Route') {
        if (ent.onestop_id) {
          this.$router.push({ name: 'routes-onestop_id', params: { onestop_id: ent.onestop_id } })
        } else {
          this.$router.push({ name: 'routes-onestop_id', params: { onestop_id: 'search' }, query: { feed_onestop_id: ent.feed_onestop_id, feed_version_sha1: ent.feed_version_sha1, route_id: ent.route_id } })
        }
      } else if (key === 'Stop') {
        if (ent.onestop_id) {
          this.$router.push({ name: 'stops-onestop_id', params: { onestop_id: ent.onestop_id } })
        } else {
          this.$router.push({ name: 'stops-onestop_id', params: { onestop_id: 'search' }, query: { feed_onestop_id: ent.feed_onestop_id, feed_version_sha1: ent.feed_version_sha1, route_id: ent.route_id } })
        }
      }
    }
  },
  methods: {
    goToSearch () {
      this.$emit('blur')
      this.$router.push({ name: 'search', query: { q: this.search } })
      this.clearSearch()
    }
  }
}
</script>
