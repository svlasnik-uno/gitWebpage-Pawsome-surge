<template>
  <div class="app-container">
    <Navbar />

    <main class="content">
      <router-view />
    </main>

    <Footer />
  </div>
</template>

<script>
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";

export default {
  components: { Navbar, Footer },
};
</script>