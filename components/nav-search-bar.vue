<template>
  <form style="flex: 1 0 auto;" @submit.prevent>
    <div class="field has-addons" style="flex: 1 0 auto;">
      <div class="control" style="flex: 1 0 auto;">
        <b-autocomplete
          :expanded="focused"
          :data="data"
          max-height="600px"
          placeholder="Search operators, feeds, and routes..."
          :loading="isFetching"
          :clearable="true"
          icon="magnify"
          @focus="focus"
          @blur="blur"
          @typing="typing"
          @select="option => selected = option"
          @keydown.esc.native="clearSearch"
        >
          <template slot-scope="props">
            {{ props.option.name }}
            <span class="is-pulled-right" style="color:#ccc">{{ props.option.type }}</span>
          </template>
        </b-autocomplete>
      </div>
      <!-- <div class="control">
        <button v-if="focused" class="button is-primary" @click="goToSearch">
          Search
        </button>
      </div> -->
    </div>
  </form>
</template>

<script>
import SearchBarMixin from '~/components/search-bar-mixin.js'
export default {
  mixins: [SearchBarMixin],
  data () {
    return {
      focused: false,
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
    typing (val) {
      this.search = val
      return this.getAsyncData(val)
    },
    selectOrSearch () {
      if (typeof this.selected !== 'undefined') {
        this.selected()
      } else {
        this.goToSearch()
      }
    },
    goToSearch () {
      this.$emit('blur')
      this.$router.push({ name: 'search', query: { q: this.search } })
      this.clearSearch()
    },
    focus () {
      this.focused = true
      this.$emit('focus')
    },
    blur () {
      this.focused = false
      this.$emit('blur')
    }
  }
}
</script>

<style scoped>
.autocomplete .control .is-expanded input {
  flex-grow: 10;
}
</style>
