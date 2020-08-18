<template>
  <div>
    radius: {{ radius }}m
    <b-slider v-model="radius" :min="0" :max="1000" ticks lazy />

    <div>
      <strong>Population weighted median income:</strong> {{ Math.floor(result.income_weighted) }}</strong>
    </div>

    <table class="content table">
      <thead>
        <tr>
          <th>Means of transportation to work</th>
          <th>Workers</th>
          <th>Workers without car</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Total workers</td>
          <td>{{ result.B08141_001_sum }}</td>
          <td>{{ result.B08141_002_sum }}</td>
        </tr>
        <tr>
          <td>Drive alone</td>
          <td>{{ result.B08141_006_sum }}</td>
          <td>{{ result.B08141_007_sum }}</td>
        </tr>
        <tr>
          <td>Carpool</td>
          <td>{{ result.B08141_011_sum }}</td>
          <td>{{ result.B08141_012_sum }}</td>
        </tr>
        <tr>
          <td>Public transit</td>
          <td>{{ result.B08141_016_sum }}</td>
          <td>{{ result.B08141_017_sum }}</td>
        </tr>
        <tr>
          <td>Walked</td>
          <td>{{ result.B08141_021_sum }}</td>
          <td>{{ result.B08141_022_sum }}</td>
        </tr>
        <tr>
          <td>Work from home</td>
          <td>{{ result.B08141_031_sum }}</td>
          <td>{{ result.B08141_032_sum }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="features.length > 0">
      <map-viewer :features="features" />

      <b-table
        :data="query"
        :striped="true"
        :narrowed="true"
        :pagination-simple="true"
      >
        <template slot-scope="props">
          <b-table-column field="geography.geoid" label="Geoid">
            {{ props.row.geography.geoid }}
          </b-table-column>
          <b-table-column field="geography.name" label="Name">
            {{ props.row.geography.name }}
          </b-table-column>
          <b-table-column field="field.table_group_title" label="Table">
            {{ props.row.field.table_group_title }}
          </b-table-column>
          <b-table-column field="field.table_field_name" label="Field">
            {{ props.row.field.table_field_name }}
          </b-table-column>
          <b-table-column field="field.table_field_title" label="Desc">
            {{ props.row.field.table_field_title }}
          </b-table-column>
          <b-table-column
            field="value"
            label="Value"
            numeric
          >
            {{ props.row.value }}
          </b-table-column>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'

const q2 = gql`
query ($agency_id: bigint, $route_id: bigint, $radius: numeric, $layer_name: String!, $table_field_names: _text) {
  query: tl_census_values_for_route_stops(args: {agency_id: $agency_id, radius: $radius, table_field_names: $table_field_names, layer_name: $layer_name, route_id: $route_id}) {
    value
    field {
          id
          table_group_name
          table_group_title
          table_field_name
          table_field_title
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

const fields = [
  'B01001_001',
  // Median income
  'B08121_001',
  // Table B08301: Means of Transportation to Work
  //   'B08301_001', // total
  //   'B08301_003', // Drove alone
  //   'B08301_004', // Carpooled
  //   'B08301_010', // Public transit
  //   'B08301_018', // Bicycle
  //   'B08301_019', // walked
  //   'B08301_021' // Other means
  'B08141_001', // total
  'B08141_002', // no vehicle available
  'B08141_006', // drove alone - total
  'B08141_007', // drove alone - no car
  'B08141_011', // carpool - total
  'B08141_012', // carpool - total
  'B08141_016', // transit - total
  'B08141_017', // transit - no car
  'B08141_021', // walked - total
  'B08141_022', // walked - no car
  'B08141_031', // wfh - total
  'B08141_032' // wfh - no car
]

export default {
  props: {
    entity: { type: Object, default () { return {} } }
  },
  data () {
    return {
      query: [],
      radius: 0.0
    }
  },
  apollo: {
    query: {
      query: q2,
      variables () {
        return {
          route_id: this.entity.id,
          agency_id: null,
          table_field_names: `{${fields.join(',')}}`,
          layer_name: 'tract',
          radius: this.radius
        }
      }
    }
  },
  computed: {
    result () {
      const agg = {}
      const ret = {}
      for (const f of this.query) {
        const a = agg[f.geography.id] || {}
        a[f.field.table_field_name] = f.value
        agg[f.geography.id] = a
        ret[`${f.field.table_field_name}_sum`] = 0
      }
      ret.total_pop = 0
      for (const f of Object.values(agg)) {
        ret.total_pop += f.B01001_001
        for (const [k, v] of Object.entries(f)) {
          ret[`${k}_sum`] += v
        }
      }
      ret.income_weighted = 0.0
      for (const f of Object.values(agg)) {
        ret.income_weighted += f.B08121_001 * (f.B01001_001 / ret.total_pop)
      }
      return ret
    },
    features () {
      const ret = []
      for (const f of this.query) {
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
