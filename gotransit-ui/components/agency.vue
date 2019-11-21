<template>
  <div class="entity">
    {{ entity.feed_version_id }} - {{ entity.id }} - {{ entity.agency_name }}
  </div>
</template>

<script>
export default {
  props: ['entity']
}
</script>
