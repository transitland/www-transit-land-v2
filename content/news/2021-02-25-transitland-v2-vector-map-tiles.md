---
layout: page
category: news
published: true
isThereTitle: true
title: "Transitland v2 Adds a Global Map and Vector Tiles"
---

Over the last year (or two?) [we've been creating Transitland v2](/news/2019/10/17/tlv2), a major rewrite of the platform's internals. Transitland v2 brings performance improvements, the option to deploy any number of customized Transitland installations (in addition to the "canonical" Transitland that lives here at [transit.land](/)), and useful new feature additions. Here's one of our favorite new additions: a "slippy map" of transit routes and stops around the world.

<img class="image" style="max-width: 800px; margin: 1em auto;" src="/images/tlv2-feature-announcements/tlv2-map-animation.gif" alt="map showing transit routes around the world, zooming in to Los Angeles, panning to Amsterdam" />

Try the Transitland global transit map yourself at [https://www.transit.land/map](/map) Pan, zoom, and place your mouse cursor over features to learn more. Click to see more details about particular routes and stops.

The Transitland global transit map powered by vector tiles in the [Mapbox Vector Tile format](https://docs.mapbox.com/vector-tiles/specification/). Any user of the [Transitland v2 Vector Tile API](/documentation/vector-tiles) can build these route line and stop location layers into their own "slippy maps" on the web, with their own styling and customizations. The tiles are always fresh &mdash; Transitland updates them with the latest data each day.

Note that Transitland continues to provide GeoJSON through the [Datastore v1 API and the upcoming v2 APIs](/documentation). When creating smaller maps or static maps, it may be simpler to use GeoJSON. The power of MVT is when you need both wide coverage and precise detail.

Not seeing public transit routes and stops where you expect to find them on the map? Help expand Transitland's coverage by contributing to the [Transitland Atlas](https://github.com/transitland/transitland-atlas), the open directory of feeds that powers Transitland's services.