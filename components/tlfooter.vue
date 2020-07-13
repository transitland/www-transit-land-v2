<template>
  <nav class="tabs is-small">
    <div class="container">
      <ul>
        <li class="is-active">
          <a>Interline Gotransit &copy; Interline Technologies LLC</a>
        </li>
        <li>
          Map Data:
        </li><li><a href="https://transit.land">Transitland</a></li>
        <li><a href="http://openstreetmap.org/copyright">&copy; OpenStreetMap</a></li>
        <li><a href="https://carto.com/attributions">&copy; CARTO</a></li>
      </ul>
    </div>
  </nav>
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
