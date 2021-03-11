<template>
  <div>
    <div class="content">
      <table class="table is-striped">
        <thead>
          <tr>
            <th>Filename</th>
            <th>Rows</th>
            <th>Size</th>
            <th>SHA1</th>
            <th>CSV</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f of files" :key="f.name">
            <td>{{ f.name }}</td>
            <td>{{ f.rows }}</td>
            <td>{{ f.size | prettyBytes }}</td>
            <td>{{ f.sha1 | shortenName(8) }}</td>
            <td>
              <b-tooltip v-if="f.csv_like" dashed>
                <template v-slot:content>
                  <div>Columns</div>
                  <ul>
                    <li v-for="i of f.header.split(',')" :key="i">
                      {{ i }}
                    </li>
                  </ul>
                </template>
                Yes
              </b-tooltip>
              <span v-else>No</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    files: { type: Array, default () { return [] } }
  }
}
</script>
