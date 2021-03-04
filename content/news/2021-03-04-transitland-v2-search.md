---
layout: page
category: news
published: true
isThereTitle: true
title: "Transitland v2 Enables Search Across 700,000+ Operators, Feeds, and Routes"
description: >
  A favorite new feature of Transitland version 2: search across all of the operators, feed records, and routes in Transitland
previewImagePath: https://www.transit.land/images/tlv2-feature-announcements/tlv2-search-animation.gif
---

Over the last year (or two?) [we've been creating Transitland v2](/news/2019/10/17/tlv2), a major rewrite of the platform's internals. Transitland v2 brings performance improvements, the option to deploy any number of customized Transitland installations (in addition to the "canonical" Transitland that lives here at [transit.land](/)), and useful new feature additions. Here's one of our favorite new additions: search across all of the operators, feed records, and routes in Transitland

<img class="image" style="max-width: 800px; margin: 1em auto;" src="/images/tlv2-feature-announcements/tlv2-search-animation.gif" alt="animated screenshot showing a user type 'Staten' in to the search field and click through to view the route page for the Staten Island Ferry in New York City" />

The new search functionality currently indexes 700,000+ records and returns results quickly &mdash; very quickly! Try it yourself. Type into the search box in the upper right corner of this page and watch as the results are returned.

Developers, we welcome you to start thinking of ways you might want to integrate Transitland's search functionality into your own apps, websites, and creations. Search will be included in the [upcoming Transitland v2 APIs](/documentation).

Search is always complicated. There are questions of what to index, how to weight different parameters, and so on. For example, we are not yet including stops/stations in the global search at this point. We welcome feedback and bug reports.

Are you searching Transitland only to find that we do not have data for your favorite transit operator? Help expand Transitland's coverage by contributing to the [Transitland Atlas](https://github.com/transitland/transitland-atlas), the open directory of feeds that powers Transitland's services.