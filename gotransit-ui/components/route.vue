<template>
  <div>
    {{ ent.agency.agency_name }}: {{ ent.route_short_name }}
  </div>
</template>

<script>
export default {
  props: ['ent']
}
</script>
