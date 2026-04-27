<template>
  <div class="footer">
    <!-- Top row -->
    <div class="footer-top">
      <router-link v-for="link in links" :key="link.to" :to="link.to" class="foot-link" active-class="active">
        {{ link.label }}
      </router-link>

      <button type="button" class="foot-link foot-button" @click="openContactModal">
        Contact Us
      </button>

      <a href="https://www.facebook.com/profile.php?id=61587162195934" target="_blank" rel="noopener noreferrer"
        class="foot-link">
        <img src="/img/fbLogo.png" width="20" height="20" alt="Facebook" />
      </a>

    </div>

    <!-- Bottom row -->
    <div class="footer-bottom">
      <img alt="Logo image" src="/img/logo.png" height="40" />
      <span>Pawsome Arts And Crafts ©2026</span>
      <img alt="Logo image" src="/img/logo.png" height="40" />
    </div>

    <!-- Contact Modal -->
    <div v-if="showContactModal" class="modal-backdrop-custom" @click.self="closeContactModal">
      <div class="modal-dialog-custom">
        <div class="modal-content-custom">
          <div class="modal-header-custom">
            <h5 class="modal-title mb-0">Contact Us</h5>
            <button type="button" class="btn-close-custom" @click="closeContactModal" aria-label="Close">
              ×
            </button>
          </div>

          <div class="modal-body-custom">
            <div v-if="submitSuccessMessage" class="alert alert-success" role="alert">
              {{ submitSuccessMessage }}
            </div>

            <div v-if="submitErrorMessage" class="alert alert-danger" role="alert">
              {{ submitErrorMessage }}
            </div>

            <form @submit.prevent="submitContactForm">
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="contactFirstName" class="form-label">First Name</label>
                  <input id="contactFirstName" v-model.trim="contactForm.firstName" type="text" class="form-control"
                    maxlength="100" required />
                </div>

                <div class="col-md-6">
                  <label for="contactLastName" class="form-label">Last Name</label>
                  <input id="contactLastName" v-model.trim="contactForm.lastName" type="text" class="form-control"
                    maxlength="100" required />
                </div>

                <div class="col-12">
                  <label for="contactEmail" class="form-label">Email Address</label>
                  <input id="contactEmail" v-model.trim="contactForm.email" type="email" class="form-control"
                    maxlength="255" required />
                </div>

                <div class="col-12">
                  <label class="form-label d-block mb-2">Reason for Contact</label>

                  <div class="form-check">
                    <input id="purchaseInquiry" v-model="contactForm.inquiryTypes" class="form-check-input"
                      type="checkbox" value="Purchase Inquiry" />
                    <label class="form-check-label" for="purchaseInquiry">
                      Purchase Inquiry
                    </label>
                  </div>

                  <div class="form-check">
                    <input id="productQuestion" v-model="contactForm.inquiryTypes" class="form-check-input"
                      type="checkbox" value="Product Question" />
                    <label class="form-check-label" for="productQuestion">
                      Product Question
                    </label>
                  </div>

                  <div class="form-check">
                    <input id="otherInquiry" v-model="contactForm.inquiryTypes" class="form-check-input" type="checkbox"
                      value="Other" />
                    <label class="form-check-label" for="otherInquiry">
                      Other
                    </label>
                  </div>

                  <div v-if="categoryError" class="text-danger small mt-1">
                    Please select at least one option.
                  </div>
                </div>

                <div class="col-12">
                  <label for="contactMessage" class="form-label">Message</label>
                  <textarea id="contactMessage" v-model.trim="contactForm.message" class="form-control" rows="5"
                    maxlength="5000" required></textarea>
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2 flex-wrap mt-4">
                <button type="button" class="btn btn-secondary" @click="closeContactModal" :disabled="isSubmitting">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                  {{ isSubmitting ? "Sending..." : "Send Message" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import APIService from "@/api/APIService";

const links = [
  { label: "Home", to: "/" },
  { label: "Events", to: "/events" },
  { label: "Gallery", to: "/gallery" },
  { label: "About Us", to: "/about" },
];

const showContactModal = ref(false);
const isSubmitting = ref(false);
const submitSuccessMessage = ref("");
const submitErrorMessage = ref("");
const categoryError = ref(false);

const createDefaultForm = () => ({
  firstName: "",
  lastName: "",
  email: "",
  inquiryTypes: [],
  message: "",
});

const contactForm = reactive(createDefaultForm());

function resetForm() {
  contactForm.firstName = "";
  contactForm.lastName = "";
  contactForm.email = "";
  contactForm.inquiryTypes = [];
  contactForm.message = "";
  categoryError.value = false;
  submitErrorMessage.value = "";
  submitSuccessMessage.value = "";
}

function openContactModal() {
  resetForm();
  showContactModal.value = true;
}

function closeContactModal() {
  if (isSubmitting.value) return;
  showContactModal.value = false;
}

async function submitContactForm() {
  submitErrorMessage.value = "";
  submitSuccessMessage.value = "";
  categoryError.value = false;

  if (!contactForm.inquiryTypes.length) {
    categoryError.value = true;
    return;
  }

  isSubmitting.value = true;

  try {
    await APIService.sendContactUsEmail({
      firstName: contactForm.firstName,
      lastName: contactForm.lastName,
      email: contactForm.email,
      inquiryTypes: [...contactForm.inquiryTypes],
      message: contactForm.message,
    });

    submitSuccessMessage.value =
      "Your message has been sent. A confirmation email has also been sent to you.";
    setTimeout(() => {
      showContactModal.value = false;
    }, 1500);
    contactForm.firstName = "";
    contactForm.lastName = "";
    contactForm.email = "";
    contactForm.inquiryTypes = [];
    contactForm.message = "";
  } catch (error) {
    submitErrorMessage.value =
      error?.message || "Unable to send your message right now.";
  } finally {
    isSubmitting.value = false;
  }
}
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

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(227, 225, 225, 0.55);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
}

.modal-dialog-custom {
  width: 100%;
  max-width: 700px;
}

.modal-content-custom {
  background: #fff;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-body-custom {
  padding: 20px;
  text-align: left;
}

.btn-close-custom {
  background: transparent;
  border: none;
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
  color: #333;
}

@media (max-width: 576px) {
  .modal-backdrop-custom {
    padding: 0;
  }

  .modal-dialog-custom {
    max-width: 100%;
  }

  .modal-content-custom {
    border-radius: 16px 16px 0 0;
  }
}
</style>