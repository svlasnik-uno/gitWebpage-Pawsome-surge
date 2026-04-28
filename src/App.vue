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
import { onMounted } from "vue";
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";
import { useAuthStore } from "@/store/AuthStore";
import { useCartStore } from "@/store/CartStore";

export default {
  components: { Navbar, Footer },

  setup() {
    const auth = useAuthStore();
    const cart = useCartStore();

    onMounted(() => {
      if (auth.isAuthenticated && auth.email) {
        cart.setUser(auth.email);
      }
    });

    return {};
  },
};
</script>
<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
}
</style>