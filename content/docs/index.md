---
title: Documentation
description: Documentation for the Transitland website and APIs.
---

Transitland brings together many sources of transit data to build a directory of operators and feeds that can be edited by transit enthusiasts and developers.

<b-message type="is-warning" has-icon>

  This documentation site primarily describes Transitland v2. Some components of Transitland v1 are deprecated but still active, including the [Transitland v1 Datastore API](/documentation/datastore/).

</b-message>

## Transitland Architecture

Here is a diagram of the overall Transitland v1 and v2 technical architecture:

<img class="image" style="width:600px" src="/images/tlv2/tlv2-architecture.png" alt="diagram of Transitland v2 technical architecture">

## Comparing the APIs

Transitland v1 and v2 provide a range of APIs. All are powered by the same underlying database cluster. Each has a different set of capabilities and constraints:

| API                             | Status           | Root Endpoint                   | API Key Required                        | Cost                    | Uses                                                                                                                             |
| ------------------------------- | ---------------- | ------------------------------- | --------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| [Transitland v2 Map Vector Tiles](/documentation/vector-tiles) | beta             | `https://transit.land/mbtiles/` | <b-icon icon="check-bold" title="yes"/> | free (with rate limits) | Powers the [map](/map). Build your own web maps of stop locations and route geometries. In Mapbox Vector Tile (MVT) format.      |
| [Transitland v2 REST API](/documentation/rest-api)         | not yet released | to be announced                 | <b-icon icon="check-bold" title="yes"/> | free (with rate limits) | Fast and easy queries for accessing common data.                                                                                 |
| [Transitland v2 GraphQL API](/documentation/graphql-api)      | not yet released | to be announced                 | <b-icon icon="check-bold" title="yes"/> | paid                    | The most flexible API for performing a wide variety of queries and analyses. May be slower than v2 REST API for certain queries. |
| [Transitland v1 Datastore API](/documentation/datastore/)    | deprecated       | `https://transit.land/api/v1`   | no                                      | free (with rate limits) | Original API for exploring data and powering apps. Has some performance limitations.                                             |

### Signing up for an API Token

Transitland v2 APIs all require an API token to access: To get an API token, follow these steps:

 1. Open to the [sign-up page](http://app.interline.io/products/tlv2_api/orders/new)
 2. If you already have an Interline account (you will have one if you use [OSM Extracts](https://www.interline.io/osm/extracts/)) press "sign in" in the upper right corner.
 3. Pick a subscription plan:
  
  - For access to Map Vector Tiles and REST API, select "Transitland API - Free Tier"
  - For access to all v2 APIs, including the GraphQL API, select "Transitland API - Pro Tier" (pricing to be announced shortly)

4. Place "order" and watch your email inbox (or your spam folder) for an API key
5. You may retrieve your API token at any time by [signing into your Interline account](https://app.interline.io/users/me)