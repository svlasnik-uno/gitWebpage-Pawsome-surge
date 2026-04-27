<template>
  <div class="container">
    <div class="row align-items-center justify-content-center">
      <div class="col-12 col-sm-8 col-md-6 col-lg-4">
        <div class="card mx-auto shadow">
          <div class="card-body">
            <div class="card-title">
              <span>Reset Password</span>
            </div>

            <div
              v-if="showMsg === 'success'"
              class="alert alert-success"
              role="alert"
            >
              Password updated successfully. Redirecting to login...
            </div>

            <div
              v-else-if="showMsg === 'error'"
              class="alert alert-danger"
              role="alert"
            >
              {{ errorMessage || 'Unable to reset password.' }}
            </div>

            <div class="card-text pt-2">
              <div class="mb-3">
                <div class="input-group mb-3">
                  <div class="input-group-prepend">
                    <span class="input-group-text">***</span>
                  </div>
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    v-model="password"
                    maxlength="100"
                    required
                    class="form-control"
                    placeholder="New Password"
                    @keyup.enter="updatePassword"
                  />
                </div>

                <div class="input-group mb-3">
                  <div class="input-group-prepend">
                    <span class="input-group-text">***</span>
                  </div>
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    v-model="confirmPassword"
                    maxlength="100"
                    required
                    class="form-control"
                    placeholder="Confirm New Password"
                    @keyup.enter="updatePassword"
                  />
                </div>

                <div class="form-check mb-3">
                  <input
                    id="showPassword"
                    v-model="showPassword"
                    class="form-check-input"
                    type="checkbox"
                  />
                  <label class="form-check-label" for="showPassword">
                    Show password
                  </label>
                </div>
              </div>

              <div class="d-flex gap-2 flex-wrap mb-2">
                <button
                  type="button"
                  class="btn btn-primary"
                  @click.prevent="updatePassword"
                  :disabled="loading || !isRecoverySession"
                >
                  {{ loading ? 'Updating...' : 'Update Password' }}
                </button>

                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="goToLogin"
                  :disabled="loading"
                >
                  Back to Login
                </button>
              </div>

              <div v-if="!isRecoverySession" class="mt-3 text-warning">
                This password reset link is invalid or has expired. Please request
                a new reset email.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="errorMessage && showMsg === 'error'"
      class="text-center mt-3 text-danger"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import router from '@/router'
import { supabase } from '@/supabase'

export default {
  name: 'ResetPassword',

  data() {
    return {
      password: '',
      confirmPassword: '',
      loading: false,
      showPassword: false,
      showMsg: '',
      errorMessage: '',
      isRecoverySession: false,
    }
  },

  async mounted() {
    await this.initializeRecoverySession()
  },

  methods: {
    async initializeRecoverySession() {
      this.showMsg = ''
      this.errorMessage = ''

      try {
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)

        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const type = params.get('type')

        if (type !== 'recovery' || !accessToken || !refreshToken) {
          this.isRecoverySession = false
          return
        }

        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) throw error

        this.isRecoverySession = true
      } catch (error) {
        console.error('Recovery session error:', error)
        this.isRecoverySession = false
        this.showMsg = 'error'
        this.errorMessage =
          error?.message || 'This reset link is invalid or expired.'
      }
    },

    async updatePassword() {
      this.showMsg = ''
      this.errorMessage = ''

      if (!this.isRecoverySession) {
        this.showMsg = 'error'
        this.errorMessage =
          'This reset link is invalid or expired. Please request a new one.'
        return
      }

      if (!this.password || !this.confirmPassword) {
        this.showMsg = 'error'
        this.errorMessage = 'Both password fields are required.'
        return
      }

      if (this.password.length < 6) {
        this.showMsg = 'error'
        this.errorMessage = 'Password must be at least 6 characters.'
        return
      }

      if (this.password !== this.confirmPassword) {
        this.showMsg = 'error'
        this.errorMessage = 'Passwords do not match.'
        return
      }

      this.loading = true

      try {
        const { error } = await supabase.auth.updateUser({
          password: this.password,
        })

        if (error) throw error

        this.showMsg = 'success'

        setTimeout(async () => {
          await supabase.auth.signOut()
          router.push('/login')
        }, 1500)
      } catch (error) {
        console.error('Update password error:', error)
        this.showMsg = 'error'
        this.errorMessage =
          error?.message || 'Unable to update password.'
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