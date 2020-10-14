<template>
  <div>
    <b-menu>
      <b-menu-list label="Documentation" expanded>
        <b-menu-item
          v-for="item of nav"
          :key="item.title"
          expanded
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
          link: '/documentation/',
          items: [
            {
              title: 'Technical Architecture',
              link: '/documentation/index#transitland-architecture'
            },
            {
              title: 'Comparing the APIs',
              link: '/documentation/index#comparing-the-apis'
            }
          ]
        },
        { title: 'Transitland Atlas', link: '/documentation/atlas' },
        {
          title: 'Onestop ID Scheme',
          link: '/documentation/onestop-id-scheme/'
        },
        {
          title: 'Transitland v2 Vector Tiles API',
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
          link: '/documentation/v1'
        },
        {
          title: 'Legal',
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
