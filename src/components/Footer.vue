<template>
  <div class="footer">
    <!-- Top row -->
    <div class="footer-top">
      <router-link
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="foot-link"
        active-class="active"
      >
        {{ link.label }}
      </router-link>

      <a href="mailto:pawsomeArtsAndCrafts@yahoo.com" class="foot-link">
        Contact Us
      </a>

      <a
        href="https://www.facebook.com/profile.php?id=61587162195934"
        target="_blank"
        class="foot-link"
      >
        <img src="/img/fbLogo.png" width="20" height="20" />
      </a>

      <router-link to="/Auth" class="foot-link">
        Admin
      </router-link>
    </div>

    <!-- Bottom row -->
    <div class="footer-bottom">
      <img alt="Logo image" src="/img/logo.png" height="40" />
      <span>Pawsome Arts And Crafts ©2026</span>
      <img alt="Logo image" src="/img/logo.png" height="40" />
    </div>
  </div>
</template>

<script setup>
const links = [
  { label: "Home", to: "/" },
  { label: "Events", to: "/events" },
  { label: "Gallery", to: "/gallery" },
  { label: "About Us", to: "/about" },
];
</script>

<style scoped>
.footer {
  text-align: center;
  padding: 16px;
  color: #0d3b66; /* dark blue */
}

/* Layout */
.footer-top,
.footer-bottom {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

/* All links unified */
.footer a,
.footer .foot-link {
  color: #0d3b66;
  text-decoration: none;
  margin: 0 8px;
  display: inline-flex;
  align-items: center;
}

/* Hover effect */
.footer a:hover,
.footer .foot-link:hover {
  text-decoration: underline;
}

/* Active router link */
.active {
  font-weight: bold;
  text-decoration: underline;
  color: #0d3b66;
}
</style>