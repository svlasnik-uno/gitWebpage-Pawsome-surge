<template>
  <div class="container">
    <div class="row align-items-center justify-content-center">
      <div class="col-12 col-sm-8 col-md-6 col-lg-4">
        <div class="card mx-auto shadow">
          <div class="card-body">
            <div class="card-title">
              <span>Forgot Password</span>
            </div>

            <div v-if="showMsg === 'success'" class="alert alert-success" role="alert">
              If that email exists, a password reset link has been sent.
              Please check your inbox.
            </div>

            <div v-else-if="showMsg === 'error'" class="alert alert-danger" role="alert">
              {{ errorMessage || 'Unable to send reset email.' }}
            </div>

            <div class="card-text pt-2">
              <div class="mb-3">
                <div class="input-group mb-3">
                  <div class="input-group-prepend">
                    <span class="input-group-text">@</span>
                  </div>
                  <input v-model.trim="email" type="email" maxlength="100" required class="form-control"
                    placeholder="Email" @keyup.enter="sendResetEmail" />
                </div>
              </div>

              <div class="d-flex gap-2 flex-wrap mb-2">
                <button type="button" class="btn btn-primary" @click.prevent="sendResetEmail" :disabled="loading">
                  {{ loading ? 'Sending...' : 'Send Reset Link' }}
                </button>

                <button type="button" class="btn btn-secondary" @click="goToLogin" :disabled="loading">
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="errorMessage && showMsg === 'error'" class="text-center mt-3 text-danger">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import router from '@/router'
import APIService from '@/api/APIService'

export default {
  name: 'ForgotPassword',

  data() {
    return {
      email: '',
      loading: false,
      showMsg: '',
      errorMessage: '',
    }
  },

  methods: {
    async sendResetEmail() {
      this.showMsg = ''
      this.errorMessage = ''

      if (!this.email) {
        this.showMsg = 'error'
        this.errorMessage = 'Email is required.'
        return
      }

      this.loading = true

      try {
        await APIService.resetPassword(this.email)
        this.showMsg = 'success'
      } catch (error) {
        console.error('Forgot password error:', error)
        this.showMsg = 'error'
        this.errorMessage = error?.message || 'Unable to send reset email.'
      } finally {
        this.loading = false
      }
    },

    goToLogin() {
      router.push('/login')
    },
  },
}
</script>