export default {
  data () {
    return {
      page: 1,
      perPage: 20,
      limit: 100,
      total: 0,
      entities: [],
      sortField: null,
      sortOrder: 'asc',
      error: null
    }
  },
  computed: {
    orderBy () {
      const ret = {}
      ret[this.sortField] = this.sortOrder
      return ret
    },
    entityOffset () {
      return Math.floor(((this.page - 1) * this.perPage) / this.limit) * this.limit
    },
    entityPage () {
      const offset = ((this.page - 1) * this.perPage) - this.entityOffset
      return this.entities.slice(offset, offset + this.perPage)
    }
  },
  methods: {
    onPageChange (page) {
      this.page = page
    },
    onSort (field, order) {
      this.sortField = field
      this.sortOrder = order
    }
  }
}
