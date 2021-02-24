import debounce from 'lodash/debounce'
import gql from 'graphql-tag'

const q = gql`
query ($search: String!) {
    feeds(limit: 10, where:{search:$search}) {
        id
        name
        onestop_id
        search_rank
    }
    operators(limit: 10, where:{search:$search, merged: true}) {
        agency_id
        agency_name
        onestop_id
        feed_onestop_id
        feed_version_sha1
        search_rank
    }
    routes(limit: 10, where:{search:$search}) {
        id
        route_id
        route_short_name
        route_long_name
        onestop_id
        feed_onestop_id
        feed_version_sha1
        agency {
            id
            agency_name
        }
        search_rank
    }
    # stops(limit: 10, where:{search:$search}) {
    #     id
    #     stop_id
    #     stop_name
    #     onestop_id
    #     feed_onestop_id
    #     feed_version_sha1
    #     route_stops(limit:1) {
    #         agency {
    #             id
    #             agency_id
    #             agency_name
    #         }
    #     }
    #     search_rank
    # }
}
`

const asyncDebounceTime = 200

export default {
  data () {
    return {
      search: '',
      data: [],
      isFetching: false
    }
  },
  methods: {
    clearSearch () {
      this.$emit('blur')
      this.search = ''
    },
    getAsyncData: debounce(function (name) {
      if (!name.length) {
        this.data = []
        return
      }
      this.isFetching = true
      const client = this.$apollo.getClient()
      return client
        .query({
          query: q,
          variables: {
            search: name
          }
        })
        .then(({ data }) => {
          const ret = []
          for (const i of data.feeds || []) {
            let name = i.onestop_id
            if (i.name) {
              name = name + ': ' + i.name
            }
            ret.push({
              route: 'feeds-feed',
              entity: i,
              type: 'Feed',
              name,
              rank: (1 + i.search_rank) * 1000,
              link: { name: 'feeds-feed', params: { feed: i.onestop_id } }
            })
          }
          for (const i of data.operators || []) {
            ret.push({
              route: 'operators-operator',
              entity: i,
              type: 'Operator',
              name: i.agency_name,
              rank: (1 + i.search_rank) * 100,
              link: { name: 'operators-onestop_id', params: { onestop_id: i.onestop_id } }
            })
          }
          for (const i of data.routes || []) {
            ret.push({
              route: 'routes-route',
              entity: i,
              type: 'Route',
              name: `${i.agency.agency_name}: ${i.route_short_name} ${i.route_long_name}`,
              rank: (1 + i.search_rank) * 10,
              link: { name: 'routes-onestop_id', params: { onestop_id: i.onestop_id } }
            })
          }
          for (const i of data.stops || []) {
            let name = ''
            if (i.route_stops.length > 0) {
              name = i.route_stops[0].agency.agency_name + ': ' + i.stop_name
            } else {
              continue
            }
            ret.push({
              route: 'stops-stop',
              entity: i,
              type: 'Stop',
              name,
              rank: (1 + i.search_rank),
              link: { name: 'stops-onestop_id', params: { onestop_id: i.onestop_id } }
            })
          }
          this.data = ret.sort(function (a, b) { return b.rank - a.rank })
          this.isFetching = false
        })
    }, asyncDebounceTime)
  }
}
