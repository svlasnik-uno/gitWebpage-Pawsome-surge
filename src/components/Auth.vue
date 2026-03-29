<template>
  <div class="container">
    <div class="row align-items-center justify-content-center">
      <div class="col-12 col-sm-6 col-md-4 col-lg-4">
        <div class="card mx-auto shadow">
          <div class="card-body">
            <div class="card-title"><span>Login</span></div>

            <div
              v-if="showMsg === 'loginError'"
              class="alert alert-danger"
              role="alert"
            >
              Invalid email or password. Please try again.
            </div>

            <div
              v-else-if="showMsg === 'confirmEmail'"
              class="alert alert-warning"
              role="alert"
            >
              Your account may need email confirmation before login.
            </div>

            <div
              v-else-if="showMsg === 'serverError'"
              class="alert alert-danger"
              role="alert"
            >
              Login failed. Please check your Supabase configuration.
            </div>

            <div class="card-text pt-2">
              <div class="col-md-10 mb-3">
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text">@</span>
                  </div>

                  <input
                    v-model.trim="credentials.email"
                    maxlength="100"
                    required
                    type="email"
                    class="form-control mb-3"
                    placeholder="Email"
                    aria-describedby="inputGroupPrepend2"
                  />

                  <div class="w-100"></div>

                  <div class="input-group-prepend">
                    <span class="input-group-text">***</span>
                  </div>

                  <input
                    :type="showPassword ? 'text' : 'password'"
                    v-model="credentials.password"
                    maxlength="100"
                    required
                    @keyup.enter="login"
                    class="form-control"
                    placeholder="Password"
                    aria-describedby="inputGroupPrepend2"
                  />
                </div>
              </div>

              <div class="d-flex gap-2 flex-wrap">
                <button
                  @click.prevent="login"
                  class="btn btn-primary"
                  :disabled="loading"
                >
                  {{ loading ? 'Logging in...' : 'Login' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="generalError" class="text-center mt-3 text-danger">
      {{ generalError }}
    </div>
  </div>
</template>

<script>
import router from '@/router'
import APIService from '@/api/APIService'
import { useAuthStore } from '@/store/AuthStore'

export default {
  name: 'Auth',

  data: () => ({
    credentials: {
      email: '',
      password: '',
    },
    showMsg: '',
    generalError: '',
    loading: false,
    showPassword: false,
  }),

  computed: {
    AuthStore() {
      return useAuthStore()
    },
  },

  methods: {
    async login() {
      this.showMsg = ''
      this.generalError = ''
      this.loading = true
      this.AuthStore.clearAuth()

      try {
        const result = await APIService.signIn(
          this.credentials.email,
          this.credentials.password
        )

        const user = result?.user || result?.session?.user

        this.AuthStore.setAuth({
          user: user?.email || this.credentials.email,
          userId: user?.id || null,
          isAuthenticated: true,
        })

        router.push('/')
      } catch (error) {
        console.error('error during login:', error)
        this.AuthStore.clearAuth()

        const msg = error?.message?.toLowerCase() || ''

        if (
          msg.includes('invalid login credentials') ||
          msg.includes('invalid email') ||
          msg.includes('invalid password')
        ) {
          this.showMsg = 'loginError'
        } else if (
          msg.includes('email not confirmed') ||
          msg.includes('email not confirmed')
        ) {
          this.showMsg = 'confirmEmail'
        } else {
          this.showMsg = 'serverError'
          this.generalError = error?.message || 'Unexpected login error.'
        }
      } finally {
        this.loading = false
      }
    },

    goToRegister() {
      router.push('/register')
    },
  },
}
</script>