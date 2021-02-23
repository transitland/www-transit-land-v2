<template>
  <b-message type="is-info" :closable="false" class="show-more-results">
    <span style="float:right" class="button" @click="$emit('click')">First {{ limit }} results shown. Click to load more.</span>
  </b-message>
</template>

<script>
export default {
  props: {
    limit: { type: Number, default: 0 }
  }
}
</script>
