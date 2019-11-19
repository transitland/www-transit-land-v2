<template>
  <div>
    <div>
      <router-link :to="{name: 'feeds-id', params: {id:ent.onestop_id}}">
        Onestop ID: {{ ent.onestop_id }}
      </router-link>
    </div>
    <div>Spec: {{ ent.spec }}</div>
    <ul>
      <li :key="name" v-for="(url,name) in ent.urls">
        {{ name }}: {{ url }}
      </li>
    </ul>
    <div v-if="ent.license.length > 0">
      License: {{ ent.license }}
    </div>
    <div v-if="ent.languages.length > 0">
      Languages: {{ ent.languages }}
    </div>

    <div>Last fetch attempted: {{ ent.feed_state.last_fetched_at | moment("from") }}</div>
    <div>Last fetch successful: {{ ent.feed_state.last_successful_fetch_at | moment("from") }}</div>
    <div>Last fetch failure: {{ ent.feed_state.last_fetch_error }}</div>

    <table>
      <thead>
        <th>Active</th>
        <th>SHA1</th>
        <th>Fetched at</th>
        <th>Earliest date</th>
        <th>Latest date</th>
        <th>Import status</th>
        <th>Agencies</th>
        <th>Routes</th>
        <th>Stops</th>
      </thead>
      <tbody>
        <tr v-for="fv in ent.feed_versions" :key="fv.id">
          <td>
            <span v-if="fv.id === ent.feed_state.feed_version.id">Active</span>
          </td>
          <td>{{ fv.sha1.substr(0,6) }}</td>
          <td>{{ fv.fetched_at | moment("from") }}</td>
          <td>{{ fv.earliest_calendar_date }}</td>
          <td>{{ fv.latest_calendar_date }}</td>
          <template v-if="fv.feed_version_gtfs_import">
            <td v-if="fv.feed_version_gtfs_import.success">
              OK
            </td>
            <td v-else-if="fv.feed_version_gtfs_import.in_progress">
              In Progress
            </td>
            <td v-else-if="fv.feed_version_gtfs_import.success == false">
              Failed
            </td>
            <td v-else>
              No
            </td>
            <td>
              <nuxt-link :to="{name: 'agencies-feed_version-id', params:{id: fv.sha1}}">
                {{ fv.agencies_aggregate.aggregate.count }}
              </nuxt-link>
            </td>
            <td>
              <nuxt-link :to="{name: 'routes-feed_version-id', params:{id: fv.sha1}}">
                {{ fv.routes_aggregate.aggregate.count }}
              </nuxt-link>
            </td>
            <td>
              <nuxt-link :to="{name: 'stops-feed_version-id', params:{id: fv.sha1}}">
                {{ fv.stops_aggregate.aggregate.count }}
              </nuxt-link>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: ['ent']
}
</script>
