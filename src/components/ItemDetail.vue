<template>
  <div class="container py-4">
    <div class="d-flex align-items-center gap-2 mb-4">
      <h2>Item Detail</h2>
      <button v-if="auth.isAuthenticated && isInCart(form)" type="button" class="btn btn-sm btn-success" disabled>
        In Cart
      </button>
    </div>

    <div v-if="loading" class="text-center py-4">
      Loading item...
    </div>

    <div v-else>
      <div v-if="errorMessage" class="alert alert-danger" role="alert">
        {{ errorMessage }}
      </div>

      <div v-else>
        <!-- Mobile view -->
        <div class="d-lg-none">
          <div class="mobile-detail-card border rounded p-3 mb-4">
            <div class="d-flex align-items-center gap-3 mb-3">
              <div class="mobile-detail-thumb-wrap">
                <img v-if="previewImageUrl" :src="previewImageUrl" alt="Item preview"
                  class="img-thumbnail mobile-detail-thumb" />
                <div v-else class="mobile-detail-thumb-placeholder text-muted small">
                  No image
                </div>
              </div>

              <div v-if="auth.isAuthenticated && auth.usertype === 'admin'" class="flex-grow-1 min-w-0">
                <div class="text small">Item Number</div>
                <div class="fw-semibold fs-5">{{ form.ItemNumber || "" }}</div>
              </div>
            </div>

            <div class="mobile-detail-fields">
              <div v-if="auth.isAuthenticated" class="mobile-detail-field py-2 border-top">
                <div class="mobile-detail-row">
                  <div class="mobile-detail-label fw-semibold small text-muted">Item Type</div>
                  <div class="mobile-detail-value text-end">{{ form.ItemType || "" }}</div>
                </div>
              </div>

              <div v-if="auth.isAuthenticated" class="mobile-detail-field py-2 border-top">
                <div class="mobile-detail-row">
                  <div class="mobile-detail-label fw-semibold small text-muted">Item Sub-type</div>
                  <div class="mobile-detail-value text-end">{{ form.ItemSubType || "" }}</div>
                </div>
              </div>

              <div class="mobile-detail-field py-2 border-top">
                <div class="mobile-detail-row">
                  <div class="mobile-detail-label fw-semibold small text-muted">Price</div>
                  <div class="mobile-detail-value text-end">{{ formatCurrency(form.ItemAskingPrice) }}</div>
                </div>
              </div>

              <div v-if="auth.isAuthenticated" class="mobile-detail-field py-2 border-top">
                <div class="mobile-detail-row">
                  <div class="mobile-detail-label fw-semibold small text-muted">Item Cost</div>
                  <div class="mobile-detail-value text-end">{{ formatCurrency(form.ItemCost) }}</div>
                </div>
              </div>

              <div v-if="auth.isAuthenticated" class="mobile-detail-field py-2 border-top">
                <div class="mobile-detail-row">
                  <div class="mobile-detail-label fw-semibold small text-muted">Item Status</div>
                  <div class="mobile-detail-value text-end">{{ formatStatus(form.ItemStatus) }}</div>
                </div>
              </div>

              <div class="mobile-detail-field py-2 border-top">
                <div class="mobile-detail-row">
                  <div class="mobile-detail-label fw-semibold small text-muted">Item Color</div>
                  <div class="mobile-detail-value text-end">{{ form.ItemColor || "" }}</div>
                </div>
              </div>

              <div class="mobile-detail-field py-2 border-top">
                <div class="mobile-detail-label fw-semibold small text-muted mb-2">Item Description</div>
                <div class="mobile-detail-description">
                  {{ form.ItemDescription || "" }}
                </div>
              </div>
            </div>

            <div class="d-flex gap-2 pt-3 border-top mt-3 flex-wrap">
              <button v-if="auth.isAuthenticated && auth.usertype === 'admin'" type="button" class="btn btn-secondary"
                @click="editItem">
                Edit Item
              </button>
              <button v-if="auth.isAuthenticated && auth.usertype === 'admin'" type="button" class="btn btn-secondary"
                @click="confirmDelete" title="Delete Item">
                Delete Item
              </button>

              <button type="button" class="btn btn-secondary" @click="goBack">
                Back
              </button>
              <button type="button" class="btn btn-secondary" @click="toggleCart(form)">
                {{ isInCart(form) ? "Remove From Cart" : "Add To Cart" }}
              </button>

            </div>
          </div>
        </div>

        <!-- Desktop / tablet view -->
        <div class="row g-4 d-none d-lg-flex detail-section">
          <div class="col-lg-8">
            <div class="row g-3">
              <div v-if="auth.isAuthenticated && auth.usertype === 'admin'" class="col-md-6">
                <label class="form-label fw-bold">Item Number</label>
                <div class="form-control readonly-field">{{ form.ItemNumber || "" }}</div>
              </div>

              <div v-if="auth.isAuthenticated && auth.usertype === 'admin'" class="col-md-6">
                <label class="form-label fw-bold">Item Type</label>
                <div class="form-control readonly-field">{{ form.ItemType || "" }}</div>
              </div>

              <div v-if="auth.isAuthenticated && auth.usertype === 'admin'" class="col-md-6">
                <label class="form-label fw-bold">Item Sub-type</label>
                <div class="form-control readonly-field">{{ form.ItemSubType || "" }}</div>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-bold">Price</label>
                <div class="form-control readonly-field">{{ formatCurrency(form.ItemAskingPrice) }}</div>
              </div>

              <div v-if="auth.isAuthenticated && auth.usertype === 'admin'" class="col-md-6">
                <label class="form-label fw-bold">Item Cost</label>
                <div class="form-control readonly-field">{{ formatCurrency(form.ItemCost) }}</div>
              </div>

              <div v-if="auth.isAuthenticated && auth.usertype === 'admin'" class="col-md-6">
                <label class="form-label fw-bold">Item Status</label>
                <div class="form-control readonly-field">{{ formatStatus(form.ItemStatus) }}</div>
              </div>

              <div v-if="auth.isAuthenticated && auth.usertype === 'admin'" class="col-md-6">
                <label class="form-label fw-bold">Item Color</label>
                <div class="form-control readonly-field">{{ form.ItemColor || "" }}</div>
              </div>

              <div class="col-12">
                <label class="form-label fw-bold">Item Description</label>
                <div class="form-control readonly-field readonly-textarea">{{ form.ItemDescription || "" }}</div>
                <div class="col-12 d-flex gap-2">
                </div>

                <button v-if="auth.isAuthenticated && auth.usertype === 'admin'" type="button" class="btn btn-secondary"
                  @click="editItem">
                  Edit Item
                </button>

                <button v-if="auth.isAuthenticated && auth.usertype === 'admin'" type="button"
                  class="btn btn-secondary ms-2" @click="confirmDelete" title="Delete Item">
                  Delete Item
                </button>

                <button type="button" class="btn btn-secondary ms-2" @click="toggleCart(form)">
                  {{ isInCart(form) ? "Remove From Cart" : "Add To Cart" }}
                </button>

                <button v-if="auth.isAuthenticated && isInCart(form)" type="button" class="btn btn-secondary ms-2"
                  @click="viewCart">
                  View Cart
                </button>
                <button type="button" class="btn btn-secondary ms-2" @click="goBack">
                  Back
                </button>

              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="image-preview-card">
              <h5 class="mb-3">Item Image</h5>

              <div class="image-preview-box">
                <img v-if="previewImageUrl" :src="previewImageUrl" alt="Item preview" class="img-fluid preview-image" />
                <div v-else class="text-muted">
                  No image available
                </div>
              </div>

              <div v-if="form.ItemImage && auth.isAuthenticated && auth.usertype === 'admin'"  class="mt-2 small text-muted">
                Current: {{ form.ItemImage }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import APIService from "@/api/APIService";
import { useItemStore } from "@/store/ItemStore";
import { useAuthStore } from "@/store/AuthStore";
import { useCartStore } from "@/store/CartStore";

export default {
  name: "ItemDetail",

  props: {
    ItemNumber: {
      type: [String, Number],
      default: "",
    },
  },

  data() {
    return {
      loading: false,
      errorMessage: "",
      form: {
        ItemNumber: "",
        ItemType: "",
        ItemSubType: "",
        ItemAskingPrice: "",
        ItemCost: "",
        ItemStatus: "",
        ItemColor: "",
        ItemImage: "",
        ItemDescription: "",
      },
      cartStore: null,
      itemStore: null,
    };
  },

  computed: {
    resolvedItemNumber() {
      return this.ItemNumber || this.$route.params.itemNumber;
    },

    previewImageUrl() {
      if (!this.form.ItemImage) {
        return "";
      }
      return APIService.getImageUrl(this.form);
    },
    auth() {
      return useAuthStore();
    },
  },

  methods: {
    async loadItem() {
      if (!this.resolvedItemNumber) {
        this.errorMessage = "No item number provided.";
        return;
      }

      this.loading = true;
      this.errorMessage = "";

      try {
        const data = await this.itemStore.fetchItemById(this.resolvedItemNumber);
        this.form = { ...this.form, ...data };
      } catch (error) {
        this.errorMessage = error.message || "Failed to load item.";
      } finally {
        this.loading = false;
      }
    },
    toggleCart(item) {
      if (!item || !item.ItemNumber) return;
      if (!this.cartStore) return;

      if (this.isInCart(item)) {
        this.removeFromCart(item);
        return;
      }

      this.addToCart(item);
    },

    addToCart(item) {
      if (!item || !item.ItemNumber) return;
      if (!this.cartStore) return;
      if (this.isInCart(item)) return;

      if (!this.auth.isAuthenticated) {
        this.cartStore.savePendingCartItem(item);
        this.$router.push({ path: "/login", query: { from: this.$route.fullPath } });
        return;
      }

      this.cartStore.addToCart(item);
    },

    removeFromCart(item) {
      if (!item || !item.ItemNumber) return;
      if (!this.cartStore) return;

      const ok = window.confirm(
        `Remove item from your cart?`
      );

      if (!ok) return;

      this.cartStore.removeFromCart(item.ItemNumber);
    },
    editItem() {
      this.$router.push({
        path: `/editItem/${this.form.ItemNumber}`,
        query: { ...this.$route.query },
      });
    },
    async confirmDelete() {
      const ok = window.confirm(
        `Are you sure you want to delete item #${this.form.ItemNumber}?`
      );
      if (!ok) return;
      try {
        await APIService.deleteItem(this.form.ItemNumber);
        this.$router.push({
          path: "/itemList",
          query: { ...this.$route.query },
        });
      } catch (error) {
        window.alert(error.message || "Delete failed.");
      }
    },
    addToCart(item) {
      if (!item || !item.ItemNumber) return;
      if (!this.cartStore) return;
      if (this.isInCart(item)) return;

      if (!this.auth.isAuthenticated) {
        this.cartStore.savePendingCartItem(item);
        this.$router.push({ path: "/login", query: { from: this.$route.fullPath } });
        return;
      }

      this.cartStore.addToCart(item);
    },

    isInCart(item) {
      if (!this.cartStore || !Array.isArray(this.cartStore.cartItems)) return false;
      if (!item || !item.ItemNumber) return false;

      return this.cartStore.cartItems.some(
        (cartItem) => String(cartItem.ItemNumber) === String(item.ItemNumber)
      );
    },
    goBack() {
      this.$router.back();
    },

    viewCart() {
      this.$router.push("/cart");
    },

    formatCurrency(value) {
      if (value == null || value === "") return "";

      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    },

    formatStatus(value) {
      const statusMap = {
        A: "Available",
        S: "Sold",
        R: "Replace",
        K: "Kept",
      };
      return statusMap[value] || value || "";
    },
  },
  created() {
    this.cartStore = useCartStore();
    this.itemStore = useItemStore();
  },
  async mounted() {
    await this.loadItem();

  },
};
</script>

<style scoped>
.readonly-field {
  background-color: #f8f9fa;
  min-height: calc(1.5em + 0.75rem + 2px);
  display: flex;
  align-items: center;
}

.readonly-textarea {
  min-height: 120px;
  white-space: pre-wrap;
  align-items: flex-start;
  padding-top: 0.375rem;
}

.image-preview-card {
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1rem;
  background: #fff;
}

.image-preview-box {
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #ced4da;
  border-radius: 0.5rem;
  background: #f8f9fa;
  padding: 0.75rem;
  text-align: center;
}

.preview-image {
  max-height: 320px;
  width: auto;
  object-fit: contain;
  border-radius: 0.375rem;
}

.mobile-detail-card {
  background: #e8e8e8;
}

.detail-section {
  background: #e8e8e8;
  padding: 1.5rem;
  border-radius: 0.5rem;
}

.mobile-detail-thumb-wrap {
  width: 88px;
  height: 88px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-detail-thumb {
  width: 88px;
  height: 88px;
  object-fit: cover;
}

.mobile-detail-thumb-placeholder {
  width: 88px;
  height: 88px;
  border: 1px dashed #ced4da;
  border-radius: 0.375rem;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0.5rem;
}

.mobile-detail-field:first-child {
  border-top: none !important;
}

.mobile-detail-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.mobile-detail-label {
  flex: 0 0 40%;
}

.mobile-detail-value {
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.mobile-detail-description {
  white-space: pre-wrap;
  word-break: break-word;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 0.75rem;
}
</style>