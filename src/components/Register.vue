<template>
  <div class="container">
    <div class="row align-items-center justify-content-center">
      <div class="col-12 col-sm-8 col-md-6 col-lg-4">
        <div class="card mx-auto shadow">
          <div class="card-body">
            <div class="card-title">
              <span>Register</span>
            </div>

            <div v-if="showMsg === 'success'" class="alert alert-success" role="alert">
              Registration successful. Check your email for a confirmation link
              if email confirmation is enabled.
            </div>

            <div v-else-if="showMsg === 'registerError'" class="alert alert-danger" role="alert">
              Registration failed. Please review your details and try again. Contact us at contact@pawsome-arts-and-crafts.com.
            </div>

            <div class="card-text pt-2">
              <div class="mb-3">
                <input v-model.trim="firstName" maxlength="50" required type="text" class="form-control mb-3"
                  placeholder="First Name" />

                <input v-model.trim="lastName" maxlength="50" required type="text" class="form-control mb-3"
                  placeholder="Last Name" />

                <input v-model.trim="phone" maxlength="20" required type="tel" class="form-control mb-3"
                  placeholder="Phone Number" />

                <div class="input-group mb-3">
                  <div class="input-group-prepend">
                    <span class="input-group-text">@</span>
                  </div>
                  <input v-model.trim="email" maxlength="100" required type="email" class="form-control"
                    placeholder="Email" aria-describedby="emailPrepend" />
                </div>

                <div class="input-group mb-3">
                  <div class="input-group-prepend">
                    <span class="input-group-text">***</span>
                  </div>
                  <input :type="showPassword ? 'text' : 'password'" v-model="password" maxlength="100" required
                    class="form-control" placeholder="Password" aria-describedby="passwordPrepend" />
                </div>

                <div class="form-check mb-3">
                  <input id="showPassword" v-model="showPassword" class="form-check-input" type="checkbox" />
                  <label class="form-check-label" for="showPassword">
                    Show password
                  </label>
                </div>
              </div>

              <div class="d-flex gap-2 flex-wrap">
                <button type="button" class="btn btn-primary" @click.prevent="register" :disabled="loading">
                  {{ loading ? 'Registering...' : 'Register' }}
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
      firstName: '',
      lastName: '',
      phone: '',
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

      if (
        !this.firstName ||
        !this.lastName ||
        !this.email ||
        !this.password
      ) {
        this.showMsg = 'registerError'
        this.errorMessage = 'All fields are required.'
        return
      }

      this.loading = true

      try {
        await APIService.signUp(this.email, this.password, {
          userType: 'customer',
          firstName: this.firstName,
          lastName: this.lastName,
          phone: this.phone,
        })

        this.showMsg = 'success'

        setTimeout(() => {
          router.push('/login')
        }, 1500)
      } catch (error) {
        console.error('Registration error:', error)
        this.showMsg = 'registerError'
        this.errorMessage = 'Registration failed. Please contact us at contact@pawsome-arts-and-crafts.com'

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