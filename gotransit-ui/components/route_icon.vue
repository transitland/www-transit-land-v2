<template>
  <span>
    <b-icon v-if="routeType == 0" icon="train" />
    <b-icon v-if="routeType == 1" icon="train" />
    <b-icon v-if="routeType == 2" icon="train" />
    <b-icon v-if="routeType == 3" icon="bus" />
    <b-icon v-if="routeType == 4" icon="ferry" />
    <span v-if="routeShortName" class="route-icon">
      {{ routeShortName }}
    </span>
    {{ routeLongName }}
  </span>
</template>

<script>
export default {
  props: ['routeType', 'routeShortName', 'routeLongName']
}
</script>
