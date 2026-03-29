<template>
  <nav class="navbar navbar-expand-lg navbar-custom">
    <ul class="nav justify-content-center align-items-center w-100">

      <!-- Logo -->
      <li class="navbar-brand">
        <img src="/img/logo.png" alt="Logo" class="logo-img" />
      </li>

      <!-- Main links -->
      <li class="nav-item" v-for="link in links" :key="link.to">
        <router-link :to="link.to" class="nav-link" :class="{ active: isActive(link.to) }">
          {{ link.label }}
        </router-link>
      </li>

      <li class="nav-item" v-if="auth.isAuthenticated">
        <router-link to="/itemList" class="nav-link">
          View Items
        </router-link>
      </li>

      <!-- Auth button -->
      <li class="nav-item">
        <!-- If logged in -->
        <button v-if="auth.isAuthenticated" class="nav-link btn btn-link" @click="handleLogout">
          Logout
        </button>

        <!-- If NOT logged in -->
        <router-link v-else to="/Auth" class="nav-link">
          Admin
        </router-link>
      </li>

    </ul>
  </nav>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/store/AuthStore"; // adjust path if needed
import APIService from "@/api/APIService";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const links = [
  { label: "Home", to: "/" },
  { label: "Gallery", to: "/gallery" },
  { label: "Events", to: "/events" },
  { label: "About Us", to: "/about" },
];

function isActive(path) {
  return route.path === path;
}

async function handleLogout() {
  try {
    await APIService.signOut();
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
}

.logo-img {
  height: 60px;
  width: auto;
}

.nav-link {
  font-weight: 500;
  cursor: pointer;
}

.nav-link.active {
  font-weight: bold;
  text-decoration: underline;
}
</style>