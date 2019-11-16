docker run -p 8080:8080 \
  -e HASURA_GRAPHQL_DATABASE_URL=postgres://irees:@docker.for.mac.localhost:5432/transitland_datastore_development \
  -e HASURA_GRAPHQL_ENABLE_CONSOLE=true \
  hasura/graphql-engine:latest

