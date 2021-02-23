<template>
  <div>
    <b-field>
      <b-input
        v-model="search"
        :placeholder="placeholder"
        type="text"
        icon="magnify"
        :icon-right="search.length > 0 ? 'close-circle' : null"
        icon-right-clickable
        class="entity-search"
        @icon-right-click="clearSearch"
        @keydown.esc.native="clearSearch"
        @input="$emit('input',$event)"
      />
    </b-field>
  </div>
</template>
<script>
export default {
  props: {
    value: { type: String, default: '' },
    placeholder: { type: String, default: 'Search' }
  },
  data () {
    return { search: this.value || '' }
  },
  methods: {
    clearSearch () {
      this.search = ''
      this.$emit('input', '')
    }
  }
}
</script>
