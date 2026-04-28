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