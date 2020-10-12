---
title: Documentation
description: Documentation for the Transitland website and APIs.
---

Transitland brings together many sources of transit data to build a directory of operators and feeds that can be edited by transit enthusiasts and developers.

<div class="notification is-warning">

  This documentation site describes Transitland v2. Some components of Transitland v1 are deprecated but still active, including the Transitland v1 Datastore API. See [Transitland v1 documentation](https://transit.land/documentation/) for more information on those components.

</div>

## Transitland Architecture

Here is a diagram of the overall Transitland v1 and v2 technical architecture:

<tlv2-architecture-diagram></tlv2-architecture-diagram>

## APIs

Transitland v1 and v2 provide a range of APIs. All are powered by the same underlying database cluster. Each has a different set of capabilities and constraints:

| API                             | Status           | Root Endpoint                   | API Key Required                        | Cost                    | Uses                                                                                                                             |
| ------------------------------- | ---------------- | ------------------------------- | --------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Transitland v1 Datastore API    | deprecated       | `https://transit.land/api/v1`   | no                                      | free (with rate limits) | Original API for exploring data and powering apps. Has some performance limitations.                                             |
| Transitland v2 Map Vector Tiles | beta             | `https://transit.land/mbtiles/` | <b-icon icon="check-bold" title="yes"/> | free (with rate limits) | Powers the [map](/map). Build your own web maps of stop locations and route geometries. In Mapbox Vector Tile (MVT) format.      |
| Transitland v2 REST API         | not yet released | to be announced                 | <b-icon icon="check-bold" title="yes"/> | free (with rate limits) | Fast and easy queries for accessing common data.                                                                                 |
| Transitland v2 GraphQL API      | not yet released | to be announced                 | <b-icon icon="check-bold" title="yes"/> | paid                    | The most flexible API for performing a wide variety of queries and analyses. May be slower than v2 REST API for certain queries. |