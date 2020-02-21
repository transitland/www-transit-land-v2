<template>
  <iframe src="https://www-transit-land-v2.s3.amazonaws.com/graphiql/index.html"/>
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
