<template>
  <div>
    <div class="columns is-centered">
      <div class="column is-three-quarters rows-wrapper">
        <div data-item="bus" class="row">
          <h2>
            A COMMUNITY-EDITED DATA SERVICE
          </h2>
          <div id="bus" class="animation bus moveToRight">
            <div class="figure bus" />
          </div>
        </div>
        <div data-item="ferry" class="row">
          <h2>
            AGGREGATING
          </h2>
          <div id="ferry" class="animation ferry moveToRight">
            <div class="figure ferry" />
          </div>
          <h2> TRANSIT NETWORKS </h2>
        </div>
        <div data-item="bike" class="row">
          <h2>
            ACROSS METROPOLITAN
          </h2>
          <div id="bike" class="animation bike moveToLeft">
            <div class="figure bike" />
          </div>
          <h2>AND RURAL </h2>
        </div>
        <div data-item="train" class="row">
          <h2>
            AREAS AROUND THE WORLD.
          </h2>
          <div id="train" class="animation train moveToLeft">
            <div class="figure train" />
          </div>
        </div>
      </div>
    </div>
    <section class="section">
      <p class="is-medium content">
        <strong>Welcome to Transitland v2.</strong> Transitland is an open data platform that collects <abbr title="General Transit Feed Specification">GTFS</abbr>, GTFS Realtime, and other open data feeds from transit providers around the world. Transitland aggregates feeds from <nuxt-link :to="{ name: 'operators' }">
          over 2,500 operators in over 55 countries
        </nuxt-link>. Use the Transitland website to browse this world of data. Or use Transitland's APIs to power your own maps, data visualizations, analyses, trip planners, or routing algorithms.
      </p>
      <p class="is-medium content">
        This website and the APIs that power it are gradually replacing Transitland v1. For the time being, the two versions will run in parallel. For Transitland v1, see <code><a href="https://transit.land">https://transit.land</a></code> and use its API at <code><a href="https://transit.land/api/v1">https://transit.land/api/v1</a></code>. For an overview of Transitland v2, see <a href="https://transit.land/news/2019/10/17/tlv2.html">this blog post</a> and <a href="http://localhost:3000/documentation">the new documentation on this website</a>.
      </p>
      <p class="is-medium content">
        Thank you to the many contributors and users who have been a part of Transitland since 2014!
      </p>
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

<style lang="scss">

/* animation */

h2 {
  padding-top: 0px;
  white-space: nowrap;
  float: left;
  font-size:32px;
}

.rows-wrapper {
  width:80%;
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
</style>
