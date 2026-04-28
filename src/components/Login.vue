<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-sm-8 col-md-6 col-lg-4">
        <div class="card shadow">
          <div class="card-body">
            <h3 class="card-title text-center mb-4">Login</h3>

            <div v-if="showMsg === 'emailNotConfirmed'" class="alert alert-warning" role="alert">
              Your email is not confirmed yet. Please check your inbox and click
              the confirmation link before logging in.
            </div>

            <div v-else-if="showMsg === 'loginError'" class="alert alert-danger" role="alert">
              {{ errorMessage || "Login failed. Please try again." }}
            </div>

            <div class="mb-3">
              <label class="form-label">Email</label>
              <input v-model.trim="email" type="email" maxlength="100" required class="form-control" placeholder="Email"
                @keyup.enter="login" />
            </div>

            <div class="mb-3">
              <label class="form-label">Password</label>
              <input :type="showPassword ? 'text' : 'password'" v-model="password" maxlength="100" required
                class="form-control" placeholder="Password" @keyup.enter="login" />
            </div>

            <div class="form-check mb-3">
              <input id="showPassword" v-model="showPassword" class="form-check-input" type="checkbox" />
              <label class="form-check-label" for="showPassword">
                Show password
              </label>
            </div>

            <div class="d-grid mb-3">
              <button type="button" class="btn btn-primary" @click.prevent="login" :disabled="loading">
                {{ loading ? "Logging in..." : "Login" }}
              </button>
            </div>

            <div class="text-center mb-2">
              <a href="#" @click.prevent="goToForgotPassword">Forgot password?</a>
            </div>

            <div class="text-center">
              <small>
                Don’t have an account?
                <a href="#" @click.prevent="goToRegister">Register here</a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import router from "@/router";
import APIService from "@/api/APIService";
import { supabase } from "@/supabase";
import { useAuthStore } from "@/store/AuthStore";
import { useCartStore } from "@/store/CartStore";

export default {
  name: "Login",

  data() {
    return {
      email: "",
      password: "",
      loading: false,
      showPassword: false,
      showMsg: "",
      errorMessage: "",
      auth: null,
      cart: null, 
    };
  },

  mounted() {
    this.auth = useAuthStore();
    this.cart = useCartStore();
    if (this.auth.isAuthenticated) {
      router.push("/");
      this.cart.setUser(this.auth.email);
    }
  },

  methods: {
    async redirectIfLoggedIn() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          router.push("/");
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    },

    async login() {
      this.showMsg = "";
      this.errorMessage = "";

      if (!this.email || !this.password) {
        this.showMsg = "loginError";
        this.errorMessage = "Email and password are required.";
        return;
      }

      this.loading = true;

      try {
        const auth = useAuthStore();
        const data = await APIService.signIn(this.email, this.password);
        const user = data?.user;

        if (!user) {
          throw new Error("Login failed.");
        }

        if (!user.email_confirmed_at) {
          await supabase.auth.signOut();
          auth.clearAuth();
          this.showMsg = "emailNotConfirmed";
          this.errorMessage = "";
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("usertype, userfirstname, userlastname, userphone")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Profile query error:", profileError);
        }

        auth.setAuth({
          user,
          userId: user.id || "",
          usertype: profile?.usertype || null,
          firstName: profile?.userfirstname || "",
          lastName: profile?.userlastname || "",
          phone: profile?.userphone || "",
          email: user?.email || "",
        });
        this.cart.setUser(user.email);
        router.push("/");
      } catch (error) {
        console.error("Login error:", error);
        this.showMsg = "loginError";
        this.errorMessage = error?.message || "Login failed.";
      } finally {
        this.loading = false;
      }
    },

    goToRegister() {
      router.push("/register");
    },

    goToForgotPassword() {
      router.push("/forgot-password");
    },
  },
};
</script>