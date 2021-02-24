export default ({ $config }) => {
  return {
    httpEndpoint: $config.graphqlEndpoint,
    httpLinkOptions: {
      credentials: 'same-origin',
      headers: {
        apikey: $config.graphqlApikey
      }
    }
  }
}
