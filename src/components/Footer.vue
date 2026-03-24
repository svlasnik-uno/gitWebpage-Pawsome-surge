<template>
  <div class="footer">
    <p>
      <!-- Navigation links -->
      <router-link
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="foot-link"
        active-class="active"
      >
        {{ link.label }}
      </router-link>

      <!-- Contact -->
      <a href="mailto:pawsomeArtsAndCrafts@yahoo.com">
        Contact Us
      </a>

      <!-- Facebook -->
      <a href="https://www.facebook.com/Pawsome.Arts.and.Crafts/" target="_blank">
        <img src="/img/fbLogo.png" width="20" height="20" />
      </a>

      <br />

      <!-- Footer branding -->
      <img alt="Logo image" src="/img/logo.png" height="60" />
      Pawsome Arts And Crafts ©2026
      <img alt="Logo image" src="/img/logo.png" height="60" />
    </p>
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
}

.foot-link {
  margin: 0 8px;
}

.active {
  font-weight: bold;
  text-decoration: underline;
}
</style>