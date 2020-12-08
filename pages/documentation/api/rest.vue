<template>
  <div class="container">
    <div id="swagger-ui" />
  </div>
</template>

<script>
import 'swagger-ui/dist/swagger-ui.css'
const SwaggerUI = require('swagger-ui')

export default {
  mounted () {
    SwaggerUI({
      url: '/rest.swagger.json',
      dom_id: '#swagger-ui',
      defaultModelRendering: 'model'
    })
  }
}
</script>
