<template>
  <div class="outer">
    <tlnav />

    <div class="main" style="flex:1">
      <nuxt />
    </div>
    <simple-analytics />
  </div>
</template>

<style scoped>
.main {
  height: calc(100vh - 60px);
  background:white;
  flex-grow:2;
}
</style>
