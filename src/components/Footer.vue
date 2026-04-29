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

      <button type="button" class="foot-link foot-button" @click="openContactModal">
        Contact Us
      </button>

      <a
        href="https://www.facebook.com/profile.php?id=61587162195934"
        target="_blank"
        rel="noopener noreferrer"
        class="foot-link"
      >
        <img src="/img/fbLogo.png" width="20" height="20" alt="Facebook" />
      </a>
    </div>

    <!-- Bottom row -->
    <div class="footer-bottom">
      <img alt="Logo image" src="/img/logo.png" height="40" />
      <span>Pawsome Arts And Crafts ©2026</span>
      <img alt="Logo image" src="/img/logo.png" height="40" />
    </div>

    <ContactUsModal
      :show="showContactModal"
      :is-submitting="isSubmitting"
      :submit-success-message="submitSuccessMessage"
      :submit-error-message="submitErrorMessage"
      :category-error="categoryError"
      :contact-form="contactForm"
      @close="closeContactModal"
      @submit="submitContactForm"
    />
  </div>
</template>

<script setup>
import ContactUsModal from "@/components/ContactUsModal.vue";
import { useContactUs } from "@/composables/useContactUs";

const links = [
  { label: "Home", to: "/" },
  { label: "Events", to: "/events" },
  { label: "Gallery", to: "/gallery" },
  { label: "About Us", to: "/about" },
];

const {
  showContactModal,
  isSubmitting,
  submitSuccessMessage,
  submitErrorMessage,
  categoryError,
  contactForm,
  openContactModal,
  closeContactModal,
  submitContactForm,
} = useContactUs();
</script>

<style scoped>
.footer {
  text-align: center;
  padding: 16px;
  color: black;
  font-weight: bold;
}

.footer-top,
.footer-bottom {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.footer a,
.footer .foot-link {
  color: black;
  text-decoration: none;
  margin: 0 8px;
  display: inline-flex;
  align-items: center;
}

.foot-button {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
}

.footer a:hover,
.footer .foot-link:hover,
.foot-button:hover {
  text-decoration: underline;
}

.footer a.foot-link.active {
  font-weight: bold;
  text-decoration: underline;
  padding: 2px 8px;
  border-radius: 6px;
}

.active {
  font-weight: bold;
  text-decoration: underline;
  color: black;
}
</style>