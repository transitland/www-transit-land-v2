<template>
  <iframe src="/graphql-console.html" />
</template>

<script>
export default {
  layout: 'map'
}
</script>

<style lang="scss" scoped>
  iframe {
    width: 100%;
    height: calc(100vh - 60px);
  }
</style>
