<template>
  <div class="container placeOrder-page py-4">
    <div
      class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4 p-3 rounded bg-white bg-opacity-100 shadow-sm">
      <div>
        <h2 class="mb-1">Place Order</h2>
        <p class="text-muted mb-0">
          Complete your delivery information and confirm your order.
        </p>
      </div>

      <div v-if="cartCount > 0" class="d-flex gap-2 flex-wrap">
        <span class="badge bg-secondary fs-6">
          {{ cartCount }} item<span v-if="cartCount !== 1">s</span>
        </span>
        <span class="badge bg-dark fs-6">
          Total: {{ formatCurrency(cartTotal) }}
        </span>
      </div>
    </div>

    <div v-if="!cartItems.length" class="alert alert-info" role="alert">
      Your cart is empty. Please add items before checking out.
    </div>

    <div v-else class="row g-4">
      <div class="col-lg-7">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="mb-3">Customer Information</h5>

            <div v-if="errorMessage" class="alert alert-danger" role="alert">
              {{ errorMessage }}
            </div>

            <div v-if="successMessage" class="alert alert-success" role="alert">
              {{ successMessage }}
            </div>

            <form @submit.prevent="openConfirmModal">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">First Name</label>
                  <input v-model.trim="form.custFirstName" type="text" class="form-control" maxlength="100" required />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Last Name</label>
                  <input v-model.trim="form.custLastName" type="text" class="form-control" maxlength="100" required />
                </div>

                <div class="col-12">
                  <label class="form-label">Email Address</label>
                  <input v-model.trim="form.orderEmail" type="email" class="form-control" maxlength="255" readonly
                    disabled /> <small class="text-muted">
                    Your order confirmation will be sent to your account email address.
                  </small>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Phone Number</label>
                  <input v-model.trim="form.orderPhone" type="text" class="form-control" maxlength="50" required />
                </div>

                <div class="col-12">
                  <label class="form-label">Street Address</label>
                  <input v-model.trim="form.orderStreetAddress" type="text" class="form-control" maxlength="255"
                    required />
                </div>

                <div class="col-md-6">
                  <label class="form-label">City</label>
                  <input v-model.trim="form.orderCity" type="text" class="form-control" maxlength="150" required />
                </div>
              </div>

              <div class="d-flex gap-2 flex-wrap mt-4">
                <button type="submit" class="btn btn-primary" :disabled="submitting || !cartItems.length">
                  {{ submitting ? "Saving..." : "Place Order" }}
                </button>

                <button type="button" class="btn btn-outline-secondary" @click="goBackToCart" :disabled="submitting">
                  Back to Cart
                </button>
              </div>
              <p class="text mt-3 mb-0">
                After placing your order, you will be contacted to complete your
                order and schedule delivery.
              </p>
            </form>
          </div>
        </div>
      </div>

      <div class="col-lg-5">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="mb-3">Order Items</h5>

            <div class="d-grid gap-3">
              <div v-for="item in cartItems" :key="item.ItemNumber" class="summary-item">
                <div class="d-flex gap-3 align-items-start">
                  <div class="thumb-wrap">
                    <img v-if="getImageThumbnailUrl(item)" :src="getImageThumbnailUrl(item)"
                      :alt="`Item ${item.ItemNumber}`" class="thumb-image" />
                    <div v-else class="thumb-placeholder text-muted small">
                      No image
                    </div>
                  </div>

                  <div class="flex-grow-1 min-w-0">
                    <div class="small mt-1">{{ item.ItemDescription || "" }}</div>
                  </div>

                  <div class="text-end fw-semibold">
                    {{ formatCurrency(item.ItemAskingPrice) }}
                  </div>
                </div>
              </div>
            </div>

            <hr />

            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-semibold">Total Items</span>
              <span>{{ cartCount }}</span>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-2">
              <span class="fw-semibold">Order Total</span>
              <span class="fs-5 fw-bold">{{ formatCurrency(cartTotal) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showConfirmModal" class="modal fade show modal-backdrop-custom" tabindex="-1" style="display: block;"
      aria-modal="true" role="dialog">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Order</h5>
            <button type="button" class="btn-close" aria-label="Close" @click="closeConfirmModal"
              :disabled="submitting"></button>
          </div>

          <div class="modal-body">
            <p class="mb-2">Are you sure you want to place this order?</p>

            <p class="text mt-3 mb-0">
              You will receive an email confirmation of your order. <br />Check
              your SPAM folder if you don't see the message.
            </p>
            <p class="mb-0 text fw-semibold">
              <b>* Delivery available for the Omaha Area only.</b>
            </p>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeConfirmModal" :disabled="submitting">
              Cancel
            </button>
            <button type="button" class="btn btn-primary" @click="submitOrder" :disabled="submitting">
              {{ submitting ? "Saving..." : "Confirm Order" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showConfirmModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import APIService from "@/api/APIService";
import { useCartStore } from "@/store/CartStore";
import { useAuthStore } from "@/store/AuthStore";

export default {
  name: "PlaceOrder",

  data() {
    return {
      cartStore: null,
      authStore: null,
      submitting: false,
      showConfirmModal: false,
      errorMessage: "",
      successMessage: "",
      form: {
        custFirstName: "",
        custLastName: "",
        orderEmail: "",
        orderPhone: "",
        orderStreetAddress: "",
        orderCity: "",
      },
    };
  },

  computed: {
    cartItems() {
      return this.cartStore?.cartItems || [];
    },

    cartCount() {
      return this.cartStore?.cartCount || 0;
    },

    cartTotal() {
      return this.cartStore?.cartTotal || 0;
    },
  },

  methods: {
    loadOrderFields() {
      this.form.custFirstName = this.authStore?.firstName || "";
      this.form.custLastName = this.authStore?.lastName || "";
      this.form.orderEmail = this.authStore?.email || "";
      this.form.orderPhone = this.authStore?.phone || "";
    },

    getImageThumbnailUrl(item) {
      return APIService.getImageThumbnailUrl(item);
    },

    formatCurrency(value) {
      if (value == null || value === "") return "";

      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(value) || 0);
    },

    validateForm() {
      if (!this.form.custFirstName) return "First name is required.";
      if (!this.form.custLastName) return "Last name is required.";
      if (!this.form.orderEmail) return "Email address is required.";
      if (!this.form.orderPhone) return "Phone number is required.";
      if (!this.form.orderStreetAddress) return "Street address is required.";
      if (!this.form.orderCity) return "City is required.";
      if (!this.cartItems.length) return "Your cart is empty.";
      if (!this.authStore?.userId) return "You must be logged in to place an order.";
      return "";
    },

    openConfirmModal() {
      this.errorMessage = "";
      this.successMessage = "";

      const validationError = this.validateForm();
      if (validationError) {
        this.errorMessage = validationError;
        return;
      }

      this.showConfirmModal = true;
    },

    closeConfirmModal() {
      if (this.submitting) return;
      this.showConfirmModal = false;
    },

    async submitOrder() {
      this.errorMessage = "";
      this.successMessage = "";
      this.submitting = true;

      try {
        if (!this.authStore?.userId) {
          this.errorMessage = "You must be logged in to place an order.";
          return;
        }
        const orderPayload = {
          user_id: this.authStore?.userId,
          orderTotal: Number(this.cartTotal || 0),
          orderEmail: this.form.orderEmail,
          orderStreetAddress: this.form.orderStreetAddress,
          orderCity: this.form.orderCity,
          orderPhone: this.form.orderPhone,
          custFirstName: this.form.custFirstName,
          custLastName: this.form.custLastName,
          orderTotalItems: this.cartCount,
          orderStatus: "P",
        };

        const createdOrder = await APIService.createCompleteCustomerOrder(
          orderPayload,
          this.cartItems
        );

        this.successMessage = `Order #${createdOrder.orderNum} was placed successfully.`;
        this.showConfirmModal = false;
        this.cartStore.clearCart();

        this.form = {
          custFirstName: "",
          custLastName: "",
          orderEmail: "",
          orderPhone: "",
          orderStreetAddress: "",
          orderCity: "",
        };

        setTimeout(() => {
          this.$router.push("/");
        }, 1500);
      } catch (error) {
        this.errorMessage = error.message || "Failed to save order.";
        this.showConfirmModal = false;
      } finally {
        this.submitting = false;
      }
    },

    goBackToCart() {
      this.$router.push("/cart");
    },
  },

  created() {
    this.cartStore = useCartStore();
    this.authStore = useAuthStore();
    this.loadOrderFields();
  },
};
</script>

<style scoped>
.placeOrder-page {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.summary-item {
  border: 1px solid #dee2e6;
  border-radius: 0.65rem;
  padding: 0.75rem;
  background: #fff;
}

.thumb-wrap {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0.35rem;
}

.modal-backdrop-custom {
  background: rgba(0, 0, 0, 0.2);
}

@media (max-width: 991.98px) {
  .thumb-wrap {
    width: 64px;
    height: 64px;
  }
}
</style>