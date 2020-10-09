---
title: Documentation
description: Documentation for the Transitland website and APIs.
---

Transitland brings together many sources of transit data to build a directory of operators and feeds that can be edited by transit enthusiasts and developers.

This documentation site describes Transitland v2. Some components of Transitland v1 are deprecated but still active, including the Transitland v1 Datastore API. See [Transitland v1 documentation](https://transit.land/documentation/) for more information on those components.

## Transitland Architecture

<div class="mermaid">
  graph TD
    u[Users] --> v2www[Transitland v2<br>Website]
    v2www --> g[Transitland v2<br>GraphQL API]
    v2api[Transitland v2<br>REST API] --> db
    u -..-> |to be released| v2api
    g --> db
    db[Postgres/PostGIS<br>database cluster]
    u -.-> |to be released| g
    u ---> v1api[Transitland v1<br>Datastore API]
    v1api --> db
    db --> lib
    lib --> db
    subgraph Transitland v2 Argo Workflow
      lib[Transitland-lib Library] 
    end
    gtfs[External GTFS Feeds] --> lib
    lib --> gtfs
</div>

## APIs

| API                             | Status           | Root Endpoint                   | API Key Required                        | Cost                  |
| ------------------------------- | ---------------- | ------------------------------- | --------------------------------------- | --------------------- |
| Transitland v1 Datastore API    | deprecated       | `https://transit.land/api/v1`   | no                                      | free (with rate limits) |
| Transitland v2 Map Vector Tiles | beta             | `https://transit.land/mbtiles/` | <b-icon icon="check-bold" title="yes"/> | free (with rate limits) |
| Transitland v2 REST API         | not yet released | to be announced                 | <b-icon icon="check-bold" title="yes"/> | free (with rate limits) |
| Transitland v2 GraphQL API      | not yet released | to be announced                 | <b-icon icon="check-bold" title="yes"/> | paid                  |