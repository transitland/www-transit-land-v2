<template>
  <div>
    <h1 class="title">
      Transit Operators
    </h1>

    <div>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti nulla eos iure eum nesciunt eligendi reiciendis ratione quasi velit repellendus id pariatur doloribus asperiores, ducimus nam. Corrupti error perspiciatis natus.</div>

    <agency-autocomplete />

    <br>

    <b-table
      :data="agencies"
      :striped="true"
      :paginated="true"
      :pagination-simple="true"
      pagination-position="top"
      sort-icon="menu-up"
    >
      <template slot-scope="props">
        <b-table-column :sortable="true" field="agency_name" label="Agency Name">
          {{ props.row.agency_name }}
        </b-table-column>
        <!-- <b-table-column :sortable="true" field="rank" label="City Score">
          {{ props.row.rank }}
        </b-table-column> -->
        <b-table-column label="FOSID">
          {{ props.row.feed_version.current_feed.onestop_id }}
        </b-table-column>
        <b-table-column label="FVID">
          {{ props.row.feed_version.sha1.substr(0,8) }}
        </b-table-column>
        <b-table-column :sortable="true" field="city" label="City">
          {{ props.row.city }}
        </b-table-column>
        <b-table-column :sortable="true" field="admin" label="State/Province">
          {{ props.row.admin }}
        </b-table-column>
        <b-table-column :sortable="true" field="country" label="Country">
          {{ props.row.country }}
        </b-table-column>
      </template>
    </b-table>
  </div>
</template>

<script>
import AgencyAutocomplete from '~/components/agency-autocomplete'

export default {
  components: { AgencyAutocomplete },
  asyncData (context) {
    const client = context.app.apolloProvider.defaultClient
    return client
      .query({
        query: require('~/graphql/active-agencies.gql'),
        variables: {
          // country_name: '%United States%'
        }
      })
      .then(({ data }) => {
        return data
      })
  },
  computed: {
    agencies () {
      return this.active_agencies.map((e) => {
        const place = e.agency_places !== undefined && e.agency_places.length > 0 ? e.agency_places[0] : {}
        return {
          id: e.id,
          agency_name: e.agency_name,
          city: place.name,
          admin: place.adm1name,
          country: place.adm0name,
          rank: place.rank,
          feed_version: e.feed_version
        }
      })
    }
  }
}
</script>
