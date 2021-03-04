<template>
  <div class="pt-6 pb-6">
    <a class="button is-primary is-outlined is-fullwidth" @click="$emit('click')">First {{ limit.toLocaleString() }} results shown. Click to load more.</a>
  </div>
</template>

<script>
export default {
  props: {
    limit: { type: Number, default: 0 }
  }
}
</script>
