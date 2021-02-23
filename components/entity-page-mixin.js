export default {
  apollo: {
    $error (e) {
      this.error = e
    },
    $query: {
      update (data) {
        if (data.entities.length === 0) {
          return this.setError({ statusCode: 404 })
        }
        return data.entities
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
    advancedMode () {
      if (this.$route.query && this.$route.query.advanced === 'true') {
        return true
      }
      return false
    },
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
      if (this.$route.query && this.$route.query.feed_onestop_id) {
        return true
      }
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
    checkSearchSkip (entityId) {
      const fosid = this.$route.query.feed_onestop_id || ''
      const eid = entityId || ''
      if (this.$route.params.onestop_id === 'search' && (fosid.length === 0 || eid.length === 0)) {
        this.setError({ statusCode: 404 })
        return true
      }
      return false
    },
    setError (e) {
      this.$nuxt.error({ statusCode: 404, message: 'Not found' })
    },
    setTab (value) {
      const tab = this.tabIndex[value]
      if (tab) {
        this.$router.replace({ hash: '#' + tab, query: this.$route.query })
      }
    }
  }
}
