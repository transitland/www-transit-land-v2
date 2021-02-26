<template>
  <div>
    <div v-if="$apollo.loading">
      Loading...
    </div>
    <div v-else-if="geographies.length === 0">
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
            <td> {{ Object.keys(tableGroups['B01001'] || {}).length }} </td>
            <td>{{ tableSums | dig(['B01001','1']) | thousands }}</td>
          </tr>

          <tr>
            <td>
              <b-tooltip dashed :label="`Median household income (B19013) in the past 12 months of ${layerInfo[layer].plural.toLowerCase()} within ${radius}m of stops, weighted by population`">
                Median Income
              </b-tooltip>
            </td>
            <td> {{ Object.keys(tableGroups['B19013'] || {}).length }} </td>
            <td>$ {{ weightedIncome| thousands }}</td>
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
            <td>{{ tableSums | dig(['B08141','1']) | thousands }}</td>
            <td>{{ tablePcts | dig(['B08141','1']) | pct }}</td>
            <td>{{ tableSums | dig(['B08141','2']) | thousands }}</td>
            <td>{{ tablePcts | dig(['B08141','2']) | pct }}</td>
          </tr>
          <tr>
            <td>Drive alone</td>
            <td>{{ tableSums | dig(['B08141','6']) | thousands }}</td>
            <td>{{ tablePcts | dig(['B08141','6']) | pct }}</td>
            <td>{{ tableSums | dig(['B08141','7']) | thousands }}</td>
            <td>{{ tablePcts | dig(['B08141','7']) | pct }}</td>
          </tr>
          <tr>
            <td>Carpool</td>
            <td>{{ tableSums | dig(['B08141','11']) | thousands }}</td>
            <td>{{ tablePcts | dig(['B08141','11']) | pct }}</td>
            <td>{{ tableSums | dig(['B08141','12']) | thousands }}</td>
            <td>{{ tablePcts | dig(['B08141','12']) | pct }}</td>
          </tr>
          <tr>
            <td>Public transit</td>
            <td>{{ tableSums | dig(['B08141','16']) | thousands }}</td>
            <td>{{ tablePcts | dig(['B08141','16']) | pct }}</td>
            <td>{{ tableSums | dig(['B08141','17']) | thousands }}</td>
            <td>{{ tablePcts | dig(['B08141','17']) | pct }}</td>
          </tr>
          <tr>
            <td>Walked</td>
            <td>{{ tableSums | dig(['B08141','21']) | thousands }}</td>
            <td>{{ tablePcts | dig(['B08141','21']) | pct }}</td>
            <td>{{ tableSums | dig(['B08141','22']) | thousands }}</td>
            <td>{{ tablePcts | dig(['B08141','22']) | pct }}</td>
          </tr>
          <tr>
            <td>Bicycle / motorcycle / taxi</td>
            <td>{{ tableSums | dig(['B08141','26']) | thousands }}</td>
            <td>{{ tablePcts | dig(['B08141','26']) | pct }}</td>
            <td>{{ tableSums | dig(['B08141','27']) | thousands }}</td>
            <td>{{ tablePcts | dig(['B08141','27']) | pct }}</td>
          </tr>
          <tr>
            <td>Work from home</td>
            <td>{{ tableSums | dig(['B08141','31']) | thousands }}</td>
            <td>{{ tablePcts | dig(['B08141','31']) | pct }}</td>
            <td>{{ tableSums | dig(['B08141','32']) | thousands }}</td>
            <td>{{ tablePcts | dig(['B08141','32']) | pct }}</td>
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

const q = gql`
query($route_ids: [Int!], $layer_name: String!, $radius: Float!, $table_names: [String!]!) {
  routes(ids: $route_ids) {
    id
    route_short_name
    census_geographies(radius: $radius, layer: $layer_name) {
      id
      geometry
      geoid
      name
      values(table_names: $table_names) {
        values
        table {
          id
          table_name
        }
      }      
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
      geographies: [],
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
    routes: {
      query: q,
      variables () {
        const q = {
          table_names: tableNames,
          layer_name: this.layer,
          radius: this.radius
        }
        if (this.agencyIds) {
          q.arg_agency_ids = `{${this.agencyIds.join(',')}}`
        } else if (this.routeIds) {
          q.route_ids = this.routeIds
        } else if (this.stopIds) {
          q.arg_stop_ids = `{${this.stopIds.join(',')}}`
        }
        return q
      },
      update (data) {
        const a = []
        for (const ent of data.routes || []) {
          for (const g of ent.census_geographies || []) {
            a.push(g)
          }
        }
        this.geographies = a
      }
    }
  },
  computed: {
    geographiesByID () {
      const a = {}
      for (const g of this.geographies) {
        a[g.id] = g
      }
      return a
    },
    tableGroups () {
      // Invert
      const tableGroups = {}
      for (const g of Object.values(this.geographiesByID)) {
        for (const tableValue of g.values) {
          const tk = tableValue.table.table_name
          if (!tableGroups[tk]) { tableGroups[tk] = {} }
          tableGroups[tk][g.id] = tableValue.values
        }
      }
      return tableGroups
    },
    tableSums () {
      // Calculate sums of each table and field
      const tableSums = {}
      for (const [tableName, geogs] of Object.entries(this.tableGroups)) {
        const tableSum = {}
        for (const table of Object.values(geogs)) {
          for (const [fieldKey, fieldValue] of Object.entries(table)) {
            if (fieldValue >= 0) {
              tableSum[fieldKey] = tableSum[fieldKey] ? tableSum[fieldKey] + fieldValue : fieldValue
            } else {
              tableSum[fieldKey] = NaN
              break
            }
          }
        }
        tableSums[tableName] = tableSum
      }
      return tableSums
    },
    tablePcts () {
      // Calculate percentage of total (field 1)
      const tablePcts = {}
      for (const [tableName, tableSum] of Object.entries(this.tableSums)) {
        const b = tablePcts[tableName] || {}
        for (const [fieldName, fieldValue] of Object.entries(tableSum)) {
          b[fieldName] = fieldValue / parseFloat(tableSum['1'])
        }
        tablePcts[tableName] = b
      }
      return tablePcts
    },
    weightedIncome () {
      // Calculated weighted income
      const totalPop = parseFloat(dig(['B01001', '1'], this.tableSums))
      let weightedIncome = 0
      for (const g of Object.keys(this.geographiesByID)) {
        const pop = parseFloat(dig(['B01001', g, '1'], this.tableGroups))
        const income = parseFloat(dig(['B19013', g, '1'], this.tableGroups))
        if (!pop || !income) {
          continue
        }
        weightedIncome += income * (pop / totalPop)
      }
      return weightedIncome
    },
    features () {
      if (this.$apollo.loading) { return [] }
      const ret = []
      for (const f of Object.values(this.geographiesByID)) {
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
