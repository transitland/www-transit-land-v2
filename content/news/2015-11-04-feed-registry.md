---
layout: page
title: "An Open Directory of Transit Data Sources: Transitland's Feed Registry"
published: true
isThereTitle: true
category: news
---
<style>
.license-attr {
  min-width: 130px;
  margin: 40px 0;
}

.license-attr div {
  float: left;
  background-image: url("/images/license.svg");
  background-size: 225px 225px;
  background-repeat: no-repeat;
  width: 75px;
  height: 75px;
  margin-right: 5px;
  position: relative;
}

.license-attr div.requires-attr {
  background-position: 0px -75px;
}

.license-attr div.allow-derivation {
  background-position: -75px 0px;
}

.license-attr div.allow-redistribution {
  background-position: -150px 0px;
}

.license-image {
  float: right;
}

/* Portrait and Landscape */
@media only screen
  and (min-device-width: 320px)
  and (max-device-width: 480px)
  and (-webkit-min-device-pixel-ratio: 2) {
    .license-image {
      width: 100%;
      text-align: center;
      display: inline-block;
    }
  }
}
</style>


Public transit works best without barriers, when it's simple for riders to transfer from one route to another, from one operator to another, and from one ticket and fare system to another. Similarly, transit data works best without barriers, when it's simple for routing engines, visualizations, and analyses to mix data from multiple sources and transit operators.

[Transitland](https://transit.land) is an experiment sponsored by Mapzen to aggregate transit data from around the world and make it seamless to use together&mdash;both technically and legally. We've been developing [the Onestop ID scheme](https://github.com/transitland/onestop-id-scheme) to enable users of all experience levels to work with stops and routes across multiple operators and datasets. Anyone can use a Onestop ID to look up transit data through the [Datastore API](/how-it-works/#slide-3) or the [Playground data explorer interface](https://transit.land/playground).

We're now pleased to offer another view into Transitland's collection of data, the [Feed Registry](https://transit.land/feed-registry). We've created the Feed Registry to help the users of open transit data answer two questions:

- **What transit operators offer open feeds?**

- **What can I legally do with each feed?**

<!-- more -->

<a href="https://transit.land/feed-registry">![screenshot of Transitland Feed Registry](https://www.mapzen.com/assets/images/feed-registry/transitland-feed-registry-screenshot.png)</a>

### What transit agencies offer open feeds?

The Feed Registry provides an overview of all the operators represented in Transitland. For every operator, we include a list of the feeds we aggregate from each. Most transit operators only offer one feed, but some, like [MTA New York City Transit](https://transit.land/feed-registry/operators/o-dr5r-nyct), are split across many feeds.

Want to use the Feed Registry's data in your own application? It's all available through the Datastore API under the <a href="https://transit.land/api/v1/operators">`/api/v1/operators`</a> and <a href="https://transit.land/api/v1/feeds">`/api/v1/feeds`</a> endpoints. We're assembling and sharing this data under <a href="https://creativecommons.org/publicdomain/zero/1.0/legalcode">Creative Commons CC0</a> (CC0), so you're free to use this catalog of operators and feeds however you see fit in your own applications and services.

For now, we only list transit operators in San Francisco and New York City. Soon, we'll be expanding our coverage worldwide, and we'll be opening the Datastore API to outside contributors to add additional operators and feeds. Do you work for a transit operator that is looking to share its data more widely? Or are you a transit data enthusiast interested in contributing to Transitland? Please <a href="mailto:hello@transit.land">write us</a>, and we'll add you to our list of beta testers.

### What can I legally do with each feed?

Operators release their transit data under a variety of licenses. To work with one feed at a time isn't very difficult; it's just a matter of reading the license and any other terms provided by the operator. But to work with more than one feed at a time becomes a challenge. Not only are there many licenses to read, but each allows slightly different permissions and imposes slightly different restrictions.

With the [Feed Registry](https://transit.land/feed-registry), we're hoping to clarify this puzzle of licenses. For each operator, we summarize three aspects about their license:

<div class="license-attr">
    <p style="clear: both;"><div class="not-requires-attr"></div> can you use this feed without attribution? Or do you need to explicitly mention in your application, visualization, or analysis that you're making use of data from this operator?</p>
    <p style="clear: both;"><div class="allow-derivation"></div> can you create derived products from this feed? For example, can you mix the feed with other sources and share the mixed file with others?</p>
    <p style="clear: both;"><div class="allow-redistribution"></div> can you take this feed and redistribute it to others, in a different context or embedded within a different application?</p>
</div>

<a class="license-image" href="https://transit.land/feed-registry"><img src="https://www.mapzen.com/assets/images/feed-registry/transitland-feed-registry-mouseover.png" alt="screenshot of Transitland Feed Registry: mousing over an informational license icon" width="211" height="319"/></a>
Each license is summarized with three icons that are color-coded for quick reference. Hold your cursor over an icon in the Feed Registry to get more information about what that license permits, or click the question mark at the top of the "License Details" column for more information. Even with just these feeds from the San Francisco and New York regions, it's possible to see how each license is "open" in a slightly different way.

Please note the Feed Registry is provided for informational purposes only and does not constitute legal advice. We make a good faith effort to ensure accuracy, but cannot guarantee the accuracy or reliability of the information provided in the Feed Registry. You are advised to click through to each feed's license, review it, and consult with a lawyer if you need proper legal advice on using and consuming the data referenced in the Feed Registry.

Your edits and corrections are welcome. Please <a href="mailto:hello@transit.land">contact us</a>.

We've already mentioned how we're planning to work together with the producers and consumers of transit data to grow the Feed Registry's coverage. We're also working together with the producers and consumers of transit to increase the number of rows in the Feed Registry that feature green license icons&mdash;in other words, that transit data is as open as possible.

Do you work at a transit agency that is hoping to make its data more open and useful to civic-minded software developers and entrepreneurial companies? We're glad to help you make all of those icons "go green." Our lawyer has drafted a model license that allows the freedoms that developers want, while also including the protections that public transit agencies need. Please visit the [Transitland website for more information about the model license](https://transit.land/an-open-project#for-data-providers).

Are you a consumer of transit data hoping to improve the accessibility of a feed? Consider writing to the feed's owner, explaining the value of open transit data, pointing them to the [Transitland website for more information about the model license](https://transit.land/an-open-project#for-data-providers), and [letting us know](mailto:hello@transit.land) what kind of response you receive. We just ask that you approach all transit agencies with respect. It's only by working together that we'll be able to join together transit data from around the world and make it truly accessible.
