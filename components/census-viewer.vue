<template>
  <div>
    <div v-if="$apollo.loading">
      Loading...
    </div>
    <div v-else-if="census.length === 0">
      <br>
      <b-notification type="is-light" has-icon icon="information" :closable="false">
        Demographic information not found for this route or is unavailable for this region. Currently, only information from the <a href="https://www.census.gov/programs-surveys/acs/news/data-releases/2018.html" target="_blank">US Census Bureau American Community Survey</a> is available.
      </b-notification>
    </div>
    <div v-else>
      <br>
      <h5 class="title is-5">
        Census results for {{ layerInfo[layer].plural.toLowerCase() }} within {{ radius }}m of a stop.
      </h5>
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
            <td>{{ Object.values(censusResult.aggs).filter((s)=>{return s.values['B01001']}).length }}</td>
            <td>{{ censusResult | dig(['sums','B01001','1']) | thousands }}</td>
          </tr>

          <tr>
            <td>
              <b-tooltip dashed :label="`Median household income (B19013) in the past 12 months of ${layerInfo[layer].plural.toLowerCase()} within ${radius}m of stops, weighted by population`">
                Median Income
              </b-tooltip>
            </td>
            <td>{{ Object.values(censusResult.aggs).filter((s)=>{return s.values['B19013']}).length }}</td>
            <td>$ {{ censusResult.income_weighted | thousands }}</td>
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
            <td>{{ censusResult | dig(['sums', 'B08141','1']) | thousands }}</td>
            <td>{{ censusResult | dig(['pcts', 'B08141','1']) | pct }}</td>
            <td>{{ censusResult | dig(['sums', 'B08141','2']) | thousands }}</td>
            <td>{{ censusResult | dig(['pcts', 'B08141','2']) | pct }}</td>
          </tr>
          <tr>
            <td>Drive alone</td>
            <td>{{ censusResult | dig(['sums', 'B08141','6']) | thousands }}</td>
            <td>{{ censusResult | dig(['pcts', 'B08141','6']) | pct }}</td>
            <td>{{ censusResult | dig(['sums', 'B08141','7']) | thousands }}</td>
            <td>{{ censusResult | dig(['pcts', 'B08141','7']) | pct }}</td>
          </tr>
          <tr>
            <td>Carpool</td>
            <td>{{ censusResult | dig(['sums', 'B08141','11']) | thousands }}</td>
            <td>{{ censusResult | dig(['pcts', 'B08141','11']) | pct }}</td>
            <td>{{ censusResult | dig(['sums', 'B08141','12']) | thousands }}</td>
            <td>{{ censusResult | dig(['pcts', 'B08141','12']) | pct }}</td>
          </tr>
          <tr>
            <td>Public transit</td>
            <td>{{ censusResult | dig(['sums', 'B08141','16']) | thousands }}</td>
            <td>{{ censusResult | dig(['pcts', 'B08141','16']) | pct }}</td>
            <td>{{ censusResult | dig(['sums', 'B08141','17']) | thousands }}</td>
            <td>{{ censusResult | dig(['pcts', 'B08141','17']) | pct }}</td>
          </tr>
          <tr>
            <td>Walked</td>
            <td>{{ censusResult | dig(['sums', 'B08141','21']) | thousands }}</td>
            <td>{{ censusResult | dig(['pcts', 'B08141','21']) | pct }}</td>
            <td>{{ censusResult | dig(['sums', 'B08141','22']) | thousands }}</td>
            <td>{{ censusResult | dig(['pcts', 'B08141','22']) | pct }}</td>
          </tr>
          <tr>
            <td>Bicycle / motorcycle / taxi</td>
            <td>{{ censusResult | dig(['sums', 'B08141','26']) | thousands }}</td>
            <td>{{ censusResult | dig(['pcts', 'B08141','26']) | pct }}</td>
            <td>{{ censusResult | dig(['sums', 'B08141','27']) | thousands }}</td>
            <td>{{ censusResult | dig(['pcts', 'B08141','27']) | pct }}</td>
          </tr>
          <tr>
            <td>Work from home</td>
            <td>{{ censusResult | dig(['sums', 'B08141','31']) | thousands }}</td>
            <td>{{ censusResult | dig(['pcts', 'B08141','31']) | pct }}</td>
            <td>{{ censusResult | dig(['sums', 'B08141','32']) | thousands }}</td>
            <td>{{ censusResult | dig(['pcts', 'B08141','32']) | pct }}</td>
          </tr>
        </tbody>
      </table>
      <br>
      <b-notification type="is-light" :closable="false">
        <a href="https://www.census.gov/programs-surveys/acs/news/data-releases/2018.html" target="_blank">US Census Bureau American Community Survey, 2018, 5 year</a>. This feature is in beta release; please verify values before using. You can provide feedback or suggestions for additional data tables using the contact information at the bottom of the page.
      </b-notification>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'

const dig = (path, object) => path.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, object)

const q2 = gql`
query ($agency_ids: [bigint!], $route_ids: [bigint!], $arg_agency_ids: _int8, $arg_route_ids: _int8, $arg_stop_ids: _int8, $radius: numeric, $layer_name: String!, $table_names: _text) {
  census: tl_census_values_for_route_stops(args: {agency_ids: $arg_agency_ids, route_ids: $arg_route_ids, stop_ids: $arg_stop_ids, radius: $radius, table_names: $table_names, layer_name: $layer_name}) {
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
    layer: { type: String, default: 'tract' },
    radius: { type: Number, default: 400 },
    stopIds: { type: Array, default () { return null } },
    routeIds: { type: Array, default () { return null } },
    agencyIds: { type: Array, default () { return null } }
  },
  data () {
    return {
      census: [],
      // copied...
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
    census: {
      query: q2,
      variables () {
        const q = {
          table_names: `{${tableNames.join(',')}}`,
          layer_name: this.layer,
          radius: this.radius
        }
        if (this.agencyIds) {
          q.arg_agency_ids = `{${this.agencyIds.join(',')}}`
        } else if (this.routeIds) {
          q.arg_route_ids = `{${this.routeIds.join(',')}}`
        } else if (this.stopIds) {
          q.arg_stop_ids = `{${this.stopIds.join(',')}}`
        }
        return q
      }
    }
  },
  computed: {
    mergedCensus () {
      // Aggregate by geography
      const aggs = {}
      for (const f of this.census) {
        const a = aggs[f.geography.id] || { values: {} }
        a.values[f.table.table_name] = f.table_values
        a.geometry = f.geography.geometry
        a.geoid = f.geography.geoid
        a.name = f.geography.name
        aggs[f.geography.id] = a
      }
      return aggs
    },
    censusResult () {
      // This is not very beautiful processing.
      const ret = {}
      const aggs = this.mergedCensus
      ret.aggs = aggs
      // Calculate sums for each table and key
      const sums = {}
      for (const f of Object.values(aggs)) {
        for (const [table, values] of Object.entries(f.values)) {
          const b = sums[table] || {}
          for (const [k, v] of Object.entries(values || {})) {
            if (v >= 0) {
              b[k] = b[k] ? b[k] + v : v
            } else {
              b[k] = NaN
              break
            }
          }
          sums[table] = b
        }
      }
      ret.sums = sums

      // Calculate percentage of total (field 1)
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
      for (const f of Object.values(ret.aggs)) {
        const values = f.values
        const valIncome = dig(['B19013', '1'], values)
        const valPop = dig(['B01001', '1'], values)
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
      if (this.$apollo.loading) { return [] }
      const ret = []
      for (const f of Object.values(this.mergedCensus)) {
        const fcopy = Object.assign({}, f)
        delete fcopy.geometry
        ret.push({
          geometry: f.geometry,
          properties: fcopy,
          type: 'Feature'
        })
      }
      return ret
    }
  },
  watch: {
    features () {
      this.$emit('setFeatures', this.features)
    }
  }
}
</script>
