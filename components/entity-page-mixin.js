export default {
  apollo: {
    $query: {
      error (e) {
        this.setError(e)
      },
      update (data) {
        if (data.entities.length === 0) {
          return this.setError({ statusCode: 404 })
        }
        this.entities = data.entities
      }
    }
  },
  data () {
    return {
      entities: [],
      activeTab: 0,
      childLabel: null,
      error: null,
      tabIndex: {}
    }
  },
  computed: {
    dataFreshness () {
      const daysAgo = []
      const n = new Date()
      try {
        for (const ent of this.entities) {
          const n2 = Date.parse(ent.feed_version.fetched_at)
          daysAgo.push(Math.floor((n2 - n) / (1000 * 3600 * 24 * -1)))
        }
      } catch {
      }
      return Math.max(...daysAgo)
    },
    linkVersion () {
      return Object.keys(this.$route.query).length > 0
    },
    search () {
      return this.$route.params.onestop_id === 'search'
    },
    entity () {
      return (this.entities && this.entities.length > 0) ? this.entities[0] : null
    },
    entityIds () {
      return this.entities.map((s) => { return s.id })
    },
    onestopId () {
      return this.$route.params.onestop_id
    },
    fvids () {
      return this.agencies.map((s) => { return s.feed_version_id })
    }
  },
  watch: {
    childLabel () {
      this.activeTab = 5
    }
  },
  mounted () {
    const tab = this.$route.hash.substr(1)
    if (tab) {
      for (const [k, v] of Object.entries(this.tabIndex)) {
        if (v === tab) {
          this.activeTab = parseInt(k)
        }
      }
    }
  },
  methods: {
    setError (e) {
      this.$nuxt.error({ statusCode: 404, message: 'failed' })
    },
    setTab (value) {
      const tab = this.tabIndex[value]
      if (tab) {
        this.$router.replace({ hash: '#' + tab, query: this.$route.query })
      }
    }
  }
}
