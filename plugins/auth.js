export default function ({ $auth, $config }, inject) {
  // inject runtime config into nuxt-auth
  $auth.strategies.auth0.options.clientId = $config.auth0clientId
  $auth.strategies.auth0.options.domain = $config.auth0domain
  $auth.strategies.auth0.options.audience = $config.auth0audience
}
