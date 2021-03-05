<template>
  <div>
    <b-menu>
      <b-menu-list label="Documentation" expanded>
        <b-menu-item
          v-for="item of nav"
          :key="item.title"
          :expanded="$route.path.startsWith(item.link)"
        >
          <template slot="label">
            <nuxt-link v-if="item.link" :to="item.link" exact>
              {{ item.title }}
            </nuxt-link>
            <template v-else>
              {{ item.title }}
            </template>
          </template>
          <b-menu-item
            v-for="child of item.items || []"
            :key="child.title"
          >
            <template slot="label">
              <nuxt-link v-if="child.link" :to="child.link">
                {{ child.title }}
              </nuxt-link>
              <template v-else>
                {{ child.title }}
              </template>
            </template>
          </b-menu-item>
        </b-menu-item>
      </b-menu-list>
    </b-menu>
  </div>
</template>

<script>
export default {
  data () {
    return {
      nav: [
        {
          title: 'Overview',
          link: '/documentation/index',
          items: [
            {
              title: 'Technical Architecture',
              link: '/documentation/index#transitland-architecture'
            },
            {
              title: 'Comparing the APIs',
              link: '/documentation/index#comparing-the-apis'
            },
            {
              title: 'Signing up for an API Token',
              link: '/documentation/index#signing-up-for-an-api-token'
            },
            {
              title: 'How to Participate',
              link: '/documentation/index#how-to-participate'
            }
          ]
        },
        { title: 'Transitland Atlas', link: '/documentation/atlas' },
        {
          title: 'Onestop ID Scheme',
          link: '/documentation/onestop-id-scheme/'
        },
        {
          title: 'Transitland v2 Vector Tiles',
          link: '/documentation/vector-tiles'
        },
        {
          title: 'Transitland v2 REST API',
          link: '/documentation/rest-api'
        },
        {
          title: 'Transitland v2 GraphQL API',
          link: '/documentation/graphql-api'
        },
        {
          title: 'Transitland v1 Datastore API',
          link: '/documentation/datastore/',
          items: [
            { title: 'API Endpoints', link: '/documentation/datastore/api-endpoints' },
            { title: 'Feeds', link: '/documentation/datastore/feeds' },
            { title: 'Routes and Route Stop Patterns', link: '/documentation/datastore/routes-and-route-stop-patterns' },
            { title: 'Stops', link: '/documentation/datastore/stops' },
            { title: 'Schedules', link: '/documentation/datastore/schedules' },
            { title: 'Changesets', link: '/documentation/datastore/changesets' },
            { title: 'Quality issues', link: '/documentation/datastore/quality_issues' }
          ]
        },
        {
          title: 'transitland-lib',
          link: '/documentation/transitland-lib'
        },
        {
          title: 'Legal',
          link: '/documentation/an-open-project/index',
          items: [
            {
              title: 'An Open Project',
              link: '/documentation/an-open-project/index'
            },
            {
              title: 'Contributor Agreement',
              link: '/documentation/an-open-project/contributor-agreement'
            }
          ]
        }
      ]
    }
  }
}
</script>
