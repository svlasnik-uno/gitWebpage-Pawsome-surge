<template>
  <nav class="navbar navbar-expand-lg navbar-custom">
    <div class="container-fluid">
      <!-- Logo -->
      <div class="navbar-brand">
        <img src="/img/logo.png" alt="Logo" class="logo-img" />
      </div>

      <!-- Hamburger button for mobile -->
      <button class="navbar-toggler" type="button" @click="toggleMenu" :aria-expanded="menuOpen" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Collapsible menu -->
      <div class="collapse navbar-collapse" :class="{ show: menuOpen }">
        <ul class="navbar-nav mx-auto">

          <!-- Main links -->
          <li class="nav-item" v-for="link in links" :key="link.to">
            <router-link :to="link.to" class="nav-link" :class="{ active: isActive(link.to) }" @click="closeMenu">
              {{ link.label }}
            </router-link>
          </li>

          <!-- AUTHENTICATED USERS BLOCK -->
          <template v-if="auth.isAuthenticated">
            <!-- Cart -->
            <li class="nav-item" v-if="cart.cartCount > 0">
              <router-link to="/cart" class="nav-link" :class="{ active: isActive('/cart') }" @click="closeMenu">
                View Cart ({{ cart.cartCount }})
              </router-link>
            </li>
            <!-- My Orders -->
            <li class="nav-item">
              <router-link to="/my-orders" class="nav-link" :class="{ active: isActive('/my-orders') }" @click="closeMenu">
                My Orders
              </router-link>
            </li>

            <!-- ADMIN SECTION -->
            <template v-if="auth.usertype === 'admin'">
              <li class="nav-item separator">
                <span class="nav-link">|</span>
              </li>

              <li class="nav-item">
                <router-link to="/itemList" class="nav-link" :class="{ active: isActive('/itemList') }" @click="closeMenu">
                  View Items
                </router-link>
              </li>

              <li class="nav-item">
                <router-link to="/eventListAdmin" class="nav-link" :class="{ active: isActive('/eventListAdmin') }" @click="closeMenu">
                  Manage Events
                </router-link>
              </li>

              <li class="nav-item">
                <router-link to="/AdminOrders" class="nav-link" :class="{ active: isActive('/AdminOrders') }" @click="closeMenu">
                  Manage Orders
                </router-link>
              </li>
            </template>

          </template>

          <!-- Auth buttons -->
          <li class="nav-item">
            <div v-if="!auth.isAuthenticated" class="d-flex gap-2 flex-column flex-lg-row">
              <router-link to="/login" class="nav-link" @click="closeMenu">
                Login
              </router-link>

              <router-link to="/register" class="nav-link" @click="closeMenu">
                Create Account
              </router-link>
            </div>

            <router-link v-else to="/login" class="nav-link" @click="handleLogout">
              Logout
            </router-link>
          </li>

        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/store/AuthStore";
import { useCartStore } from "@/store/CartStore";
import APIService from "@/api/APIService";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const cart = useCartStore();

const menuOpen = ref(false);

const links = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/availableItems" },
  { label: "Gallery", to: "/gallery" },
  { label: "Events", to: "/events" },
  { label: "About Us", to: "/about" },
];

function isActive(path) {
  return route.path === path;
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

function closeMenu() {
  menuOpen.value = false;
}

async function handleLogout() {
  try {
    await APIService.signOut();

    cart.clearLocalState(); // clears visible cart in memory only
    auth.clearAuth();

    router.push("/");
  } catch (error) {
    console.error("Logout failed:", error.message);
  }
}
</script>

<style scoped>
.navbar-custom {
  padding: 1rem 0;
  background-color: rgb(227, 225, 225);
}

.navbar-toggler {
  border: none;
  background: none;
  padding: 0.25rem 0.75rem;
}

.navbar-toggler:focus {
  box-shadow: none;
  outline: none;
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%280, 0, 0, 0.55%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='m4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}

.logo-img {
  height: 60px;
  width: auto;
}

.nav-link {
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 1rem;
}

.nav-link.active {
  font-weight: bold;
  text-decoration: underline;
}

.separator .nav-link {
  pointer-events: none;
  cursor: default;
  opacity: 0.6;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.navbar-custom .nav-link {
  color: black !important;
}

.navbar-custom .nav-link:hover {
  color: #333 !important;
}

.navbar-custom .nav-link.active {
  color: black !important;
  font-weight: bold;
  text-decoration: underline;
}

/* Mobile styles */
@media (max-width: 991.98px) {
  .navbar-custom {
    padding: 0.5rem 1rem;
  }

  .navbar-collapse {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: rgb(227, 225, 225);
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    z-index: 1000;
    padding: 1rem 0;
  }

  .navbar-nav {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
  }

  .nav-item {
    width: 100%;
    text-align: center;
  }

  .nav-link {
    display: block;
    padding: 0.75rem 1rem;
    border-radius: 0.25rem;
    margin: 0.25rem 1rem;
  }

  .nav-link:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .d-flex.gap-2 {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem !important;
  }

  .separator {
    display: none;
  }
}
</style>