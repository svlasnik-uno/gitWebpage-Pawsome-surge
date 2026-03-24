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

      <a href="mailto:pawsomeArtsAndCrafts@yahoo.com">
        Contact Us
      </a>

      <a href="https://www.facebook.com/Pawsome.Arts.and.Crafts/" target="_blank">
        <img src="/img/fbLogo.png" width="20" height="20" />
      </a>
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
<style>
.footer {
  text-align: center;
  padding: 16px;
}

.footer-top,
.footer-bottom {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap; /* prevents overlap on small screens */
  margin-bottom: 10px;
}

.foot-link {
  margin: 0 8px;
}

.active {
  font-weight: bold;
  text-decoration: underline;
}
</style>