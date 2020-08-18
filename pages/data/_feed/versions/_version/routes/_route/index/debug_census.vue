<template>
  <div>
    radius: {{ radius }}m
    <b-slider v-model="radius" :min="0" :max="1000" ticks lazy />

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

// const q = gql`
// query ($agency_id: bigint, $route_id: bigint, $radius: numeric, $layer_name: String!, $table_group_name: String!, $table_field_name: String!) {
//   query: tl_census_values_for_route_stops_aggregate(args: {agency_id: $agency_id, radius: $radius, table_group_name: $table_group_name, table_field_name: $table_field_name, layer_name: $layer_name, route_id: $route_id}) {
//     aggregate {
//       sum {
//         value
//       }
//     }
//     nodes {
//       field_id
//       geography_id
//       value
//     }
//   }
// }
// `

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
          table_field_names: '{B01001_001}',
          layer_name: 'tract',
          radius: this.radius
        }
      }
    }
  },
  computed: {
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
  },
  mounted () {
    this.$emit('update:label', 'Debug Census Data')
  }
}
</script>
