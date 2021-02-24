export default ({ $config }) => {
  return {
    httpEndpoint: $config.graphqlEndpoint,
    httpLinkOptions: {
      credentials: 'same-origin',
      headers: {
        referer: $config.graphqlServerReferer,
        apikey: $config.graphqlApikey
      }
    }
  }
}
