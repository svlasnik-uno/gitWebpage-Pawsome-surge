<template>
  <nav class="navbar navbar-expand-lg navbar-custom">
    <ul class="nav justify-content-center">
      <li class="navbar-brand">
        <img src="/img/logo.png" alt="Logo" class="logo-img" />
      </li>

      <li class="nav-item" v-for="link in links" :key="link.to">
        <router-link
          :to="link.to"
          class="nav-link"
          :class="{ active: isActive(link.to) }"
        >
          {{ link.label }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();

const links = [
  { label: "Home", to: "/" },
    { label: "Gallery", to: "/gallery" },
  { label: "Events", to: "/events" },
  { label: "About Us", to: "/about" },
];
function isActive(path) {
  return route.path === path;
}
</script>
