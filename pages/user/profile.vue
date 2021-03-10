<template>
  <div>
    <div v-if="$auth.loggedIn">
      <div class="notification is-info">
        You are currently logged in.
      </div>

      <pre>{{ $auth.user }}</pre>

      <br>

      <b-field>
        <button class="button" @click="$auth.logout()">
          Log out
        </button>
      </b-field>
    </div>
    <div v-else>
      You are not logged in. Click <a href="/login">here</a> to login.
    </div>
  </div>
</template>

<script>
export default {
  head () {
    return {
      title: 'Account'
    }
  }
}
</script>
