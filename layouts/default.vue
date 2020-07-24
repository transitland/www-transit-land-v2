<template>
  <div class="outer">
    <tlnav />

    <div class="main" style="flex:1">
      <div class="container section">
        <nuxt />
      </div>
    </div>
    <simple-analytics />

    <tlfooter />
  </div>
</template>

<style scoped>
.outer {
  display:flex;
  min-height:100vh;
  flex-direction:column;
}
.main {
  background:white;
  flex:1;
}
</style>
