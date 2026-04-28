<template>
  <div class="container py-4 list-items-page bg-white shadow-sm rounded px-4">
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
      <div>
        <h2 class="mb-1">Available Items</h2>
        <p class="text mb-0">Browse currently available inventory and add items to your cart.</p>
        <b>
          <p class="text mb-0">Available for local, Omaha Area, delivery only.</p>
        </b>
        <p class="text mb-0 small">* All dimensions are approximate</p>
      </div>

      <div v-if="cartCount > 0" class="badge bg-secondary fs-6" style="cursor: pointer;" @click="$router.push('/cart')">
        View Cart and Checkout: {{ cartCount }} item<span v-if="cartCount !== 1">s</span>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      Loading available items...
    </div>

    <div v-else>
      <div v-if="errorMessage" class="alert alert-danger" role="alert">
        {{ errorMessage }}
      </div>

      <div v-else-if="!items.length" class="alert alert-info" role="alert">
        No available items were found.
      </div>

      <div v-else class="row g-3">
        <div v-for="item in items" :key="item.ItemNumber" class="col-12 col-md-6 col-xl-4">

            <div class="card h-100 shadow-sm item-card">
              <div class="image-wrap">
                <img v-if="getImageUrl(item)" :src="getImageUrl(item)" :alt="`Item ${item.ItemNumber}`"
                  class="card-img-top item-image" />
                <div v-else class="image-placeholder text-muted small">
                  No image available
                </div>
              </div>

              <div class="card-body d-flex flex-column p-3">


                <div class="detail-list small mb-2">

                  <div class="detail-row">
                    <span class="detail-label">Price</span>
                    <span class="detail-value">{{ formatCurrency(item.ItemAskingPrice) }}</span>
                  </div>

                </div>

                <div class="mb-2">
                  <div class="text-muted small fw-semibold mb-1">Description</div>
                  <div class="description-box small">
                    {{ item.ItemDescription || '' }}
                  </div>
                </div>

                <div class="mt-auto d-grid gap-2">
                  <button type="button" class="btn btn-sm btn-primary" @click="addToCart(item)"
                    :disabled="isInCart(item)">
                    {{ isInCart(item) ? "In Cart" : "Add To Cart" }}
                  </button>

                  <button type="button" class="btn btn-sm btn-outline-secondary" @click="viewItem(item)">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button v-show="showBackToTop" type="button" class="btn btn-primary back-to-top" @click="scrollToTop"
        aria-label="Back to top" title="Back to top">
        <i class="bi bi-arrow-up"></i>
      </button>
    </div>
</template>

<script>
import APIService from "@/api/APIService";
import { useCartStore } from "@/store/CartStore";
import { useItemStore } from "@/store/ItemStore";
import { useAuthStore } from "@/store/AuthStore";

export default {
  name: "AvailableItemGrid",

  props: {
    autoLoad: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      loading: false,
      errorMessage: "",
      items: [],
      cartStore: null,
      itemStore: null,
      authStore: null,
      showBackToTop: false,
    };
  },

  computed: {
    cartCount() {
      return this.cartStore?.cartItems?.length || 0;
    },
  },

  methods: {
    async loadItems() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const data = await this.itemStore.fetchAvailableItems();
        this.items = Array.isArray(data) ? data : [];
      } catch (error) {
        this.errorMessage = error.message || "Failed to load available items.";
      } finally {
        this.loading = false;
      }
    },

    addToCart(item) {
      if (this.isInCart(item)) return;
      if (!this.authStore?.isAuthenticated) {
        this.cartStore.savePendingCartItem(item);
        this.$router.push({ path: "/login", query: { from: this.$route.fullPath } });
        return;
      }
      this.cartStore.addToCart(item);
    },

    isInCart(item) {
      return this.cartStore.cartItems.some(
        (cartItem) => String(cartItem.ItemNumber) === String(item.ItemNumber)
      );
    },

    viewItem(item) {
      this.$router.push({
        path: `/itemDetail/${item.ItemNumber}`,
      });
    },

    getImageUrl(item) {
      return APIService.getImageUrl(item);
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

    statusBadgeClass(status) {
      return status === "A" ? "text-bg-success" : "text-bg-secondary";
    },

    handleScroll() {
      this.showBackToTop = window.scrollY > 300;
    },

    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
  },

  created() {
    this.cartStore = useCartStore();
    this.itemStore = useItemStore();
    this.authStore = useAuthStore();
  },

  mounted() {
    if (this.autoLoad) {
      this.loadItems();
    }

    window.addEventListener("scroll", this.handleScroll);
    this.handleScroll();
  },

  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },
};
</script>


<style scoped>
.item-card {
  border: 1px solid #dee2e6;
  border-radius: 0.65rem;
  max-width: 340px;
  margin: 0 auto;
}

.image-wrap {
  height: 260px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-top-left-radius: 0.65rem;
  border-top-right-radius: 0.65rem;
  padding: 0.5rem;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 0.35rem;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  text-align: center;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.list-items-page {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid #f1f3f5;
  padding-bottom: 0.25rem;
}

.detail-label {
  color: #6c757d;
  font-weight: 600;
  flex: 0 0 38%;
}

.detail-value {
  text-align: right;
  flex: 1;
  word-break: break-word;
}

.description-box {
  min-height: 72px;
  max-height: 72px;
  overflow: hidden;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.45rem;
  padding: 0.5rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.back-to-top {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.2);
}

.back-to-top i {
  font-size: 1.25rem;
  line-height: 1;
}

@media (max-width: 767.98px) {
  .item-card {
    max-width: 100%;
  }

  .image-wrap {
    height: 150px;
  }

  .detail-row {
    flex-direction: column;
    gap: 0.1rem;
  }

  .detail-value {
    text-align: left;
  }

  .back-to-top {
    right: 1rem;
    bottom: 1rem;
    width: 44px;
    height: 44px;
  }
}
</style>