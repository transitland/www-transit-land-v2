<template>
  <div>
    <div v-if="$apollo.loading && noData">
      Loading
    </div>
    <div v-else-if="noData">
      <b-notification type="is-light" has-icon icon="information" :closable="false">
        Demographic information is currently only available for the United States.
      </b-notification>
    </div>
    <div v-else>
      <map-viewer v-if="features.length > 0" :features="features" :interactive="false" />
      <br>

      <div>
        <b-field grouped>
          <b-field label="Stop Buffer Radius (m)" expanded style="margin-right:50px">
            <b-slider
              v-model="radius"
              size="is-medium"
              :min="0"
              :max="2000"
              :step="100"
              ticks
              lazy
            >
              <template v-for="val in [400,1000,2000]">
                <b-slider-tick :key="val" :value="val">
                  {{ val }}
                </b-slider-tick>
              </template>
            </b-slider>
          </b-field>

          <b-field label="Summary Level" expanded>
            <b-select v-model="layer">
              <option v-for="(v,k) of layerInfo" :key="k" :value="k">
                {{ v.name }}
              </option>
            </b-select>
          </b-field>
        </b-field>
      </div>

      <div v-if="$apollo.loading">
        Loading
      </div>
      <div v-else>
        <table class="content table" style="width:100%">
          <thead>
            <tr>
              <th />
              <th>{{ layerInfo[layer].plural }}</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <b-tooltip dashed :label="`Population (B01001) of ${layerInfo[layer].plural.toLowerCase()} within ${radius}m of stops`">
                  Population
                </b-tooltip>
              </td>
              <td>{{ Object.entries(result.aggs).filter((s)=>{return s[1]['B01001']}).length }}</td>
              <td>{{ result | dig(['sums','B01001','1']) | thousands }}</td>
            </tr>

            <tr>
              <td>
                <b-tooltip dashed :label="`Median household income (B19013) in the past 12 months of ${layerInfo[layer].plural.toLowerCase()} within ${radius}m of stops, weighted by population`">
                  Median Income
                </b-tooltip>
              </td>
              <td>{{ Object.entries(result.aggs).filter((s)=>{return s[1]['B19013']}).length }}</td>
              <td>$ {{ result.income_weighted | thousands }}</td>
            </tr>
          </tbody>
        </table>

        <table class="content table" style="width:100%">
          <thead>
            <tr>
              <th>
                <b-tooltip dashed label="Means of transportation to work by vehicles available (B08141)">
                  Means of transport to work
                </b-tooltip>
              </th>
              <th>Workers</th>
              <th>(% of total)</th>
              <th>w/o car</th>
              <th>(% of total)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:solid 2px #ccc">
              <td>Total workers</td>
              <td>{{ result | dig(['sums', 'B08141','1']) | thousands }}</td>
              <td>{{ result | dig(['pcts', 'B08141','1']) | pct }}</td>
              <td>{{ result | dig(['sums', 'B08141','2']) | thousands }}</td>
              <td>{{ result | dig(['pcts', 'B08141','2']) | pct }}</td>
            </tr>
            <tr>
              <td>Drive alone</td>
              <td>{{ result | dig(['sums', 'B08141','6']) | thousands }}</td>
              <td>{{ result | dig(['pcts', 'B08141','6']) | pct }}</td>
              <td>{{ result | dig(['sums', 'B08141','7']) | thousands }}</td>
              <td>{{ result | dig(['pcts', 'B08141','7']) | pct }}</td>
            </tr>
            <tr>
              <td>Carpool</td>
              <td>{{ result | dig(['sums', 'B08141','11']) | thousands }}</td>
              <td>{{ result | dig(['pcts', 'B08141','11']) | pct }}</td>
              <td>{{ result | dig(['sums', 'B08141','12']) | thousands }}</td>
              <td>{{ result | dig(['pcts', 'B08141','12']) | pct }}</td>
            </tr>
            <tr>
              <td>Public transit</td>
              <td>{{ result | dig(['sums', 'B08141','16']) | thousands }}</td>
              <td>{{ result | dig(['pcts', 'B08141','16']) | pct }}</td>
              <td>{{ result | dig(['sums', 'B08141','17']) | thousands }}</td>
              <td>{{ result | dig(['pcts', 'B08141','17']) | pct }}</td>
            </tr>
            <tr>
              <td>Walked</td>
              <td>{{ result | dig(['sums', 'B08141','21']) | thousands }}</td>
              <td>{{ result | dig(['pcts', 'B08141','21']) | pct }}</td>
              <td>{{ result | dig(['sums', 'B08141','22']) | thousands }}</td>
              <td>{{ result | dig(['pcts', 'B08141','22']) | pct }}</td>
            </tr>
            <tr>
              <td>Bicycle / motorcycle / taxi</td>
              <td>{{ result | dig(['sums', 'B08141','26']) | thousands }}</td>
              <td>{{ result | dig(['pcts', 'B08141','26']) | pct }}</td>
              <td>{{ result | dig(['sums', 'B08141','27']) | thousands }}</td>
              <td>{{ result | dig(['pcts', 'B08141','27']) | pct }}</td>
            </tr>
            <tr>
              <td>Work from home</td>
              <td>{{ result | dig(['sums', 'B08141','31']) | thousands }}</td>
              <td>{{ result | dig(['pcts', 'B08141','31']) | pct }}</td>
              <td>{{ result | dig(['sums', 'B08141','32']) | thousands }}</td>
              <td>{{ result | dig(['pcts', 'B08141','32']) | pct }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <br>
      <b-notification type="is-light" :closable="false">
        <a href="https://www.census.gov/programs-surveys/acs/news/data-releases/2018.html" target="_blank">US Census Bureau American Community Survey, 2018, 5 year</a>
        <br>
        This feature is in beta release; please verify values before using.
      </b-notification>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'

const dig = (path, object) => path.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, object)

const q2 = gql`
query ($agency_id: bigint, $route_id: bigint, $stop_id: bigint, $radius: numeric, $layer_name: String!, $table_names: _text) {
  query: tl_census_values_for_route_stops(args: {agency_id: $agency_id, radius: $radius, table_names: $table_names, layer_name: $layer_name, route_id: $route_id, stop_id: $stop_id}) {
    table_values
    table {
      id
      table_name
    }
    geography {
      id
      name
      geoid
      geometry
    }
  }
}
`

const tableNames = [
  // Population by sex
  'B01001',
  // Median income
  'B19013',
  // Means of transportation to work by vehicles available
  'B08141' // total
]

export default {
  props: {
    entity: { type: Object, default () { return {} } }
  },
  data () {
    return {
      noData: true,
      query: [],
      radius: 400.0,
      layer: 'tract',
      layerInfo: {
        tract: { name: 'Tract', plural: 'Tracts' },
        county: { name: 'County', plural: 'Counties' },
        bg: { name: 'Block Group', plural: 'Block Groups' }
        // state: { name: 'State', plural: 'States' },
        // city: { name: 'City (Census Designated Place)', plural: 'Cities' },
        // cd: { name: 'Congressional District', plural: 'Congressional Districts' }
      }
    }
  },
  apollo: {
    q: {
      query: q2,
      variables () {
        return {
          route_id: this.entity.id,
          agency_id: null,
          table_names: `{${tableNames.join(',')}}`,
          layer_name: this.layer,
          radius: this.radius
        }
      },
      update (data) {
        this.query = data.query
        // If we get data returned on the first query, set noData to false.
        if (this.noData && data.query.length > 0) {
          this.noData = false
        }
      }
    }
  },
  computed: {
    result () {
      const ret = {}
      // Aggregate by geography
      const aggs = {}
      for (const f of this.query) {
        const a = aggs[f.geography.id] || {}
        a[f.table.table_name] = f.table_values
        aggs[f.geography.id] = a
      }
      ret.aggs = aggs
      // Calculate sums
      const sums = {}
      for (const f of this.query) {
        const b = sums[f.table.table_name] || {}
        for (const [k, v] of Object.entries(f.table_values || {})) {
          if (v >= 0) {
            b[k] = b[k] ? b[k] + v : v
          } else {
            b[k] = NaN
            break
          }
        }
        sums[f.table.table_name] = b
      }
      // Calculate percentage of total (field 1)
      ret.sums = sums
      const pcts = {}
      for (const [k, v] of Object.entries(ret.sums)) {
        const b = pcts[k] || {}
        for (const [i, j] of Object.entries(v)) {
          b[i] = j / parseFloat(v['1'])
        }
        pcts[k] = b
      }
      ret.pcts = pcts
      // Calculated weighted income
      const totalPop = dig(['sums', 'B01001', '1'], ret)
      ret.pop = parseFloat(totalPop)
      let weightedIncome = NaN // init as NaN
      for (const f of Object.values(aggs)) {
        const valIncome = dig(['B19013', '1'], f)
        const valPop = dig(['B01001', '1'], f)
        if (valIncome >= 0 && valPop >= 0 && totalPop >= 0) {
          if (isNaN(weightedIncome)) { weightedIncome = 0.0 } // init as 0 when seeing first value
          weightedIncome += valIncome * (valPop / totalPop)
        } else {
          weightedIncome = NaN
          break
        }
      }
      ret.income_weighted = weightedIncome
      return ret
    },
    features () {
      const ret = []
      const seen = {}
      for (const f of this.query) {
        if (seen[f.geography.id]) {
          continue
        }
        seen[f.geography.id] = true
        ret.push({
          geometry: {
            type: 'Polygon',
            coordinates: f.geography.geometry.coordinates.slice()
          },
          properties: {
            id: f.geography.id

          },
          type: 'Feature'
        })
      }
      return ret
    }
  }
}
</script>
