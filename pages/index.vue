<template>
  <div>
    <div class="columns is-centered">
      <div class="tl-animation-hero column rows-wrapper">
        <div data-item="bus" class="row">
          <span>
            A COMMUNITY-EDITED DATA SERVICE
          </span>
          <div id="bus" class="animation bus moveToRight">
            <div class="figure bus" />
          </div>
        </div>
        <div data-item="ferry" class="row">
          <span>
            AGGREGATING
          </span>
          <div id="ferry" class="animation ferry moveToRight">
            <div class="figure ferry" />
          </div>
          <span> TRANSIT NETWORKS </span>
        </div>
        <div data-item="bike" class="row">
          <span>
            ACROSS METROPOLITAN
          </span>
          <div id="bike" class="animation bike moveToLeft">
            <div class="figure bike" />
          </div>
          <span>AND RURAL </span>
        </div>
        <div data-item="train" class="row">
          <span>
            AREAS AROUND THE WORLD.
          </span>
          <div id="train" class="animation train moveToLeft">
            <div class="figure train" />
          </div>
        </div>
      </div>
    </div>
    <section class="hero is-info is-bold">
      <div class="hero-body container content is-medium">
        <h1 class="title is-1">
          Welcome to Transitland <span class="tag is-large is-warning">Version 2</span>
        </h1>
        <p>
          Transitland is an open data platform that collects <abbr title="General Transit Feed Specification">GTFS</abbr>, GTFS Realtime, and other open data feeds from transit providers around the world. Transitland aggregates feeds from <nuxt-link :to="{ name: 'operators' }">
            over 2,500 operators in over 55 countries
          </nuxt-link>. Use the Transitland website to browse this world of data. Or use Transitland's APIs to power your own maps, data visualizations, analyses, trip planners, or routing algorithms.
        </p>
        <p>
          This new Transitland v2 website and the APIs that power it are gradually replacing Transitland v1. For the time being, the two versions will run in parallel:
        </p>
        <ul>
          <li>
            <!-- eslint-disable-next-line -->
            For an overview of Transitland v2, see <nuxt-link to="/news/2019/10/17/tlv2.html">this blog post</nuxt-link> and <nuxt-link to="/documentation">the new documentation on this website</nuxt-link>.
          </li>
          <li>For Transitland v1, see <code><a href="https://v1.transit.land">https://v1.transit.land</a></code> and use its API at <code><a href="https://transit.land/api/v1">https://transit.land/api/v1</a></code>. </li>
        </ul>
        <p>
          Thank you to the many contributors and users who have been a part of Transitland since 2014!
        </p>
      </div>
    </section>
    <section class="section">
      <h2 class="title is-2">
        What is Transitland?
      </h2>
      <div class="columns has-text-centered content is-medium">
        <div class="column is-one-third">
          <h4 class="title is-4">
            A Global Transit Map
          </h4>
          <p>Pan and zoom on Transitland's transit map to see routes and stops around the world. We've designed the map to emphasize buses and trains with more frequent service, while still showing the full extend of transit coverage.</p>
          <nuxt-link to="/map" class="button is-secondary">
            Explore the Map
          </nuxt-link>
        </div>
        <div class="column is-one-third">
          <h4 class="title is-4">
            Use the APIs
          </h4>
          <p>Transitland provides a set of open APIs to power your own creations. Skip the hassle of building transit data ingestion infrastructure and build atop the dependable foundation of Transitland.</p>
          <nuxt-link to="/documentation" class="button is-secondary">
            Read API Documentation
          </nuxt-link>
        </div>
        <div class="column is-one-third">
          <h4 class="title is-4">
            Contribute and Expand
          </h4>
          <p>Transitland is powered by the Transitland Atlas (a Distributed Mobility Feed Registry repository) and open-source tools. <a href="https://www.interline.io">Interline</a> is ready to help you expand or integrate these tools for custom mobility data needs.</p>
          <a class="button is-secondary" href="https://github.com/transitland/transitland-atlas">
            Contribute to Transitland Atlas on GitHub
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  head () {
    return {
      title: 'Welcome'
    }
  }
}
</script>

<style lang="scss" scoped>

.title {
  text-align: center;
}

.tl-animation-hero {
   @media only screen and (max-width: $tablet - 1) {
     display: none !important;
   }
   @media only screen and (min-width: $tablet) and (max-width: $desktop - 1) {
    transform: scale(.8);
  }
   @media only screen and (min-width: $desktop) and (max-width: $widescreen - 1) {
    transform: scale(.95);
  }
  @media only screen and (min-width: $widescreen) {
    transform: scale(1);
  }
  span {
    @extend .title;
    padding-top: 0px;
    white-space: nowrap;
    float: left;
    font-size: 32px;
  }

  .rows-wrapper {
    text-align:center;
  }

  .row {
    padding : 14px;
    margin: 5px 0;
  }
  .row:after {
    clear: both;
    content: "";
    display: table;
  }

  //animation
  .moveToRight {
    -moz-animation-duration: 9s;
    -webkit-animation-duration: 9s;
    animation-duration: 9s;
    -moz-animation-name: moveToRight;
    -webkit-animation-name: moveToRight;
    animation-name: moveToRight;
  }

  @keyframes moveToRight {
    from {
      background-position: 0% 0%;
    }
    to {
      background-position: -1392px 0%;
    }
  }

  .moveToLeft {
    -moz-animation-duration: 10s;
    -webkit-animation-duration: 10s;
    animation-duration: 10s;
    -moz-animation-name: moveToLeft;
    -webkit-animation-name: moveToLeft;
    animation-name: moveToLeft;
  }

  @keyframes moveToLeft {
    from {
      background-position: 0% 0%;
    }
    to {
      background-position: 1392px 0%;
    }
  }
  //animation

  .animation {
    display: inline;
    height: 48px;
    float: left;
    background-repeat: repeat-x;
    background-size: 1392px 40px;
    position: relative;

    &.bus {
      width: calc(100% - 40px - 650px);
      background-image: url('~assets/images/animation/bus_bg.png');

    }
    &.ferry {
      width: calc(100% - 40px - 605px);
      background-image: url('~assets/images/animation/ferry_bg.png');
    }
    &.bike {
      width: calc(100% - 40px - 621px);
      background-image: url('~assets/images/animation/bike_bg.png');
    }
    &.train {
      width: calc(100% - 40px - 497px);
      background-image: url('~assets/images/animation/train_bg.png');
    }
  }

  .figure {
    position: absolute;
    height: 48px;
    &.bus {
      width: 101px;
      bottom: 8px;
      background-image: url('~assets/images/animation/bus.png');
    }
    &.ferry {
      width: 101px;
      left: 5%;
      background-image: url('~assets/images/animation/ferry.png');
    }
    &.bike {
      width: 71px;
      bottom: 8px;
      right: 10px;
      background-image: url('~assets/images/animation/bike.png');
    }
    &.train {
      width: 146px;
      bottom: 8px;
      right: 20px;
      background-image: url('~assets/images/animation/train.png');
    }
  }
}

.hero a {
  border-bottom: 1px dashed $grey-color;
}
code a {
  border: none !important;
}
</style>
