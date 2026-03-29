<!--Not currently used - add to Navbar to allow new user to register 
Required to authenticate email when register -->
<template>
  <div class="container">
    <div class="row align-items-center justify-content-center">
      <div class="col-12 col-sm-6 col-md-4 col-lg-4">
        <div class="card mx-auto shadow">
          <div class="card-body">
            <div class="card-title"><span>Register</span></div>

            <div
              v-if="showMsg === 'success'"
              class="alert alert-success"
              role="alert"
            >
              Registration successful. Check your email for a confirmation link
              if email confirmation is enabled.
            </div>

            <div
              v-else-if="showMsg === 'registerError'"
              class="alert alert-danger"
              role="alert"
            >
              Registration failed. Please review your details and try again.
            </div>

            <div class="card-text pt-2">
              <div class="col-md-10 mb-3">
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text">@</span>
                  </div>

                  <input
                    v-model.trim="email"
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
                    v-model="password"
                    maxlength="100"
                    required
                    class="form-control mb-3"
                    placeholder="Password"
                    aria-describedby="inputGroupPrepend2"
                  />
                </div>
              </div>

              <div class="d-flex gap-2 flex-wrap">
                <button
                  type="button"
                  class="btn btn-primary"
                  @click.prevent="register"
                  :disabled="loading"
                >
                  {{ loading ? 'Registering...' : 'Register' }}
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
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="text-center mt-3 text-danger">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import router from '@/router'
import APIService from '@/api/APIService'

export default {
  name: 'Register',

  data() {
    return {
      email: '',
      password: '',
      loading: false,
      showPassword: false,
      showMsg: '',
      errorMessage: '',
    }
  },

  methods: {
    async register() {
      this.showMsg = ''
      this.errorMessage = ''
      this.loading = true

      try {
        await APIService.signUp(this.email, this.password)

        this.showMsg = 'success'

        setTimeout(() => {
          router.push('/auth')
        }, 1500)
      } catch (error) {
        console.error('Registration error:', error)
        this.showMsg = 'registerError'
        this.errorMessage = error?.message || 'Registration failed.'
      } finally {
        this.loading = false
      }
    },

    goToLogin() {
      router.push('/auth')
    },
  },
}
</script>