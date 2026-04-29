<template>
  <div v-if="show" class="modal-backdrop-custom" @click.self="$emit('close')">
    <div class="modal-dialog-custom">
      <div class="modal-content-custom">
        <div class="modal-header-custom">
          <h5 class="modal-title mb-0">Contact Us</h5>
          <button
            type="button"
            class="btn-close-custom"
            @click="$emit('close')"
            aria-label="Close"
          >
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

          <form @submit.prevent="$emit('submit')">
            <div class="row g-3">
              <div class="col-md-6">
                <label for="contactFirstName" class="form-label">First Name</label>
                <input
                  id="contactFirstName"
                  v-model.trim="contactForm.firstName"
                  type="text"
                  class="form-control"
                  maxlength="100"
                  required
                />
              </div>

              <div class="col-md-6">
                <label for="contactLastName" class="form-label">Last Name</label>
                <input
                  id="contactLastName"
                  v-model.trim="contactForm.lastName"
                  type="text"
                  class="form-control"
                  maxlength="100"
                  required
                />
              </div>

              <div class="col-12">
                <label for="contactEmail" class="form-label">Email Address</label>
                <input
                  id="contactEmail"
                  v-model.trim="contactForm.email"
                  type="email"
                  class="form-control"
                  maxlength="255"
                  required
                />
              </div>

              <div class="col-12">
                <label class="form-label d-block mb-2">Reason for Contact</label>

                <div class="form-check">
                  <input
                    id="purchaseInquiry"
                    v-model="contactForm.inquiryTypes"
                    class="form-check-input"
                    type="checkbox"
                    value="Purchase Inquiry"
                  />
                  <label class="form-check-label" for="purchaseInquiry">
                    Purchase Inquiry
                  </label>
                </div>

                <div class="form-check">
                  <input
                    id="productQuestion"
                    v-model="contactForm.inquiryTypes"
                    class="form-check-input"
                    type="checkbox"
                    value="Product Question"
                  />
                  <label class="form-check-label" for="productQuestion">
                    Product Question
                  </label>
                </div>

                <div class="form-check">
                  <input
                    id="otherInquiry"
                    v-model="contactForm.inquiryTypes"
                    class="form-check-input"
                    type="checkbox"
                    value="Other"
                  />
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
                <textarea
                  id="contactMessage"
                  v-model.trim="contactForm.message"
                  class="form-control"
                  rows="5"
                  maxlength="5000"
                  required
                ></textarea>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 flex-wrap mt-4">
              <button
                type="button"
                class="btn btn-secondary"
                @click="$emit('close')"
                :disabled="isSubmitting"
              >
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
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  isSubmitting: {
    type: Boolean,
    required: true,
  },
  submitSuccessMessage: {
    type: String,
    default: "",
  },
  submitErrorMessage: {
    type: String,
    default: "",
  },
  categoryError: {
    type: Boolean,
    default: false,
  },
  contactForm: {
    type: Object,
    required: true,
  },
});

defineEmits(["close", "submit"]);
</script>

<style scoped>
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