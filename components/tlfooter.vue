<template>
  <footer class="footer">
    <div class="columns is-centered">
      <div class="column is-2">
        <ul>
          <h6>technology</h6>
          <li>
            <a href="/feed-registry">Feed Registry</a>
          </li>
          <li>
            <a href="/documentation/datastore/">Datastore</a>
          </li>
          <li>
            <a href="/playground">Playground</a>
          </li>
          <li>
            <a href="/documentation/onestop-id-scheme/">Onestop ID scheme</a>
          </li>
        </ul>
      </div>
      <div class="column is-2">
        <ul>
          <h6>legal</h6>
          <li>
            <a href="/an-open-project">An Open Project</a>
          </li>
          <li>
            <a href="/an-open-project/developer-agreement.html">API Developer Agreement</a>
          </li>
          <li>
            <a href="/an-open-project/contributor-agreement.html">Data Contributor Agreement</a>
          </li>
        </ul>
      </div>
      <div class="column is-2">
        <ul>
          <h6>resources</h6>
          <li>
            <a href="/news">News & Updates</a>
          </li>
          <li>
            <a href="/documentation/">Documentation</a>
          </li>
        </ul>
      </div>
      <div class="column is-2">
        <ul>
          <h6>participate</h6>
          <li>
            <b-icon icon="fa-smile-o" />
            <a href="/participate">How to Participate</a>
          </li>
          <li>
            <b-icon icon="fa-github-alt" />
            <a href="//github.com/transitland">GitHub</a>
          </li>
          <li>
            <b-icon icon="fa-twitter" />
            <a href="//twitter.com/transitland">Twitter</a>
          </li>
          <li>
            <b-icon icon="fa-envelope-o" />
            <a href="mailto:hello@transit.land">Email</a>
          </li>
        </ul>
      </div>
    </div>
    <div class="mapzen-text">
      Transitland source code is © <a href="https://mapzen.com">Mapzen Foundation</a>, a project of <a href="https://www.linuxfoundation.org/">The Linux Foundation</a>. Transitland website and platform are operated by <a href="https://www.interline.io">Interline Technologies</a>.
    </div>
  </footer>
</template>

<style scoped>

.footer {
  background-image: url("~assets/images/animation/ferry_bg.png");
  background-position: center bottom;
  background-repeat: repeat-x;
}
.mapzen-text {
  text-align: center;
  font-style: italic;
  margin-bottom: 20px;
}
a {
  color: #666;
}
ul {
  list-style-type: none;
  padding: 0 0;
  font-weight: 400;
}
li {
  width: 100%;
  line-height: 1.8;
  font-weight: 400;
}
h6 {
  font-weight: 600;
  text-transform: uppercase;
}
.fa { padding-right:5px; }
</style>
