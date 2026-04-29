<template>
  <main class="site-content py-2">
    <div class="container about-container">
      <div class="card text-center mx-auto about-card">
        <div class="card-header">
          About Us
        </div>

        <div class="card-body about-card">
          <p class="card-text">
            We create custom, long-lasting Sola-Wood flower arrangements,
            hand-crocheted items, and other arts and crafts.
            <br />
            <br />
            We love animals, and 10% of profits are donated to
            <br />
            <a href="https://townandcountryanimalrescue.org/" target="_blank" rel="noopener noreferrer">
              <img src="/img/tacar-logo.jpg" alt="Town and Country Animal Rescue logo" width="30" height="30" />
              Town and Country Animal Rescue
            </a>
            <br />
            We hope you love our designs as much as we do!
          </p>
          <button type="button" class="foot-link foot-button" @click="openContactModal">
            Contact Us
          </button>
          <p class="card3-img-top mb-0">
            <img src="/img/logo.png" alt="Pawsome arts and crafts logo" class="card-img-top about-logo" />
          </p>
        </div>
        <div class="mt-3">
          <h5>What are Sola Wood Flowers? </h5>
          <p>
             <br>Sola wood flowers are handcrafted from the wood of the <em>Aeschynomene aspera</em> plant.
            <br>We soften and hand-dye raw sola wood flowers for our custom arrangements.
          </p>
        </div>
      </div>
      <ContactUsModal :show="showContactModal" :is-submitting="isSubmitting"
        :submit-success-message="submitSuccessMessage" :submit-error-message="submitErrorMessage"
        :category-error="categoryError" :contact-form="contactForm" @close="closeContactModal"
        @submit="submitContactForm" />
    </div>
  </main>
</template>

<script setup>
import { useContactUs } from "@/composables/useContactUs";
import ContactUsModal from "@/components/ContactUsModal.vue";

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
.about-card {
  max-width: 700px;
}

.about-logo {
  max-width: 400px;
  margin: 0 auto;
}

.about-card {
  height: 700px;
  overflow: hidden;
  border: none;
}

.about-container {
  max-width: 100%;
  /* try 600px–750px */

}
</style>