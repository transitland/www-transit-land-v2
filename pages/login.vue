<template>
  <div>
    <div class="columns">
      <div class="column is-one-third is-offset-one-third">
        <div v-if="$auth.loggedIn">
          <div class="notification is-info">
            You are currently logged in.
          </div>
        </div>
        <div v-else>
          <b-notification v-if="errorMessage" type="is-danger" has-icon :closable="false">
            {{ errorMessage }}
          </b-notification>
          <b-notification v-if="$auth.$state.redirect" type="is-warning" has-icon :closable="false">
            You must login to access this resource.
          </b-notification>
          <div>
            <span class="title is-3 text-center">
              Login
            </span>
            <hr>
            <b-field label="">
              <span
                class="button is-primary"
                @click="$auth.loginWith('auth0')"
              >
                Login with Auth0
              </span>
            </b-field>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      username: '',
      password: '',
      error: null
    }
  },
  computed: {
    redirect () {
      return (
        this.$route.query.redirect &&
        decodeURIComponent(this.$route.query.redirect)
      )
    },
    errorMessage () {
      const { error } = this
      if (!error || typeof error === 'string') {
        return error
      }
      let msg = ''
      if (error.response.status) {
        msg = 'Login failed.'
      } else if (error.message) {
        msg += error.message
      } else if (error.errors) {
        msg += `(${JSON.stringify(error.errors)
          .replace(/[{}"[\]]/g, '')
          .replace(/:/g, ': ')
          .replace(/,/g, ' ')})`
      }
      return msg
    }
  },
  head () {
    return {
      title: 'Login'
    }
  }
}
</script>

<style scoped>
.login-button {
  border: 0;
}
</style>
