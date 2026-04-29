<template>
  <div class="container py-4 my-orders-page">
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
      <div>
        <h2 class="mb-1">My Orders</h2>
        <p class="text-muted mb-0">
          View your recent orders and the items included in each order.
        </p>
      </div>

      <div class="d-flex gap-2 flex-wrap">
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="loadOrders"
          :disabled="loading"
        >
          {{ loading ? "Refreshing..." : "Refresh" }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="alert alert-info">Loading your orders...</div>

    <div v-else-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>

    <div v-else-if="!orders.length" class="alert alert-secondary">
      You do not have any orders yet.
      <button
        type="button"
        class="btn btn-secondary ms-2"
        @click="continueShopping"
      >
        View Available Items
      </button>
    </div>

    <div v-else class="card shadow-sm">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-sm table-striped align-middle order-table mb-0">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Placed</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th style="width: 120px;">Details</th>
              </tr>
            </thead>

            <tbody>
              <template v-for="order in orders" :key="order.orderNum">
                <tr>
                  <td>{{ order.orderNum }}</td>
                  <td>{{ formatDate(order.created_at) }}</td>
                  <td>{{ order.orderTotalItems }}</td>
                  <td>{{ formatCurrency(order.orderTotal) }}</td>
                  <td>{{ getStatusLabel(order.orderStatus) }}</td>
                  <td>
                    <button
                      class="btn btn-outline-primary btn-sm"
                      @click="toggleOrderDetails(order.orderNum)"
                    >
                      {{ expandedOrders[order.orderNum] ? "Hide Details" : "Order Details" }}
                    </button>
                  </td>
                </tr>

                <tr v-if="expandedOrders[order.orderNum]" class="details-row">
                  <td colspan="6">
                    <div class="p-2">
                      <div class="row g-3 mb-3">
                        <div class="col-md-6">
                          <div>
                            <strong>Name:</strong>
                            {{ order.custFirstName }} {{ order.custLastName }}
                          </div>
                          <div><strong>Email:</strong> {{ order.orderEmail }}</div>
                          <div><strong>Phone:</strong> {{ order.orderPhone }}</div>
                        </div>

                        <div class="col-md-6">
                          <div><strong>Street Address:</strong> {{ order.orderStreetAddress }}</div>
                          <div><strong>City:</strong> {{ order.orderCity }}</div>
                        </div>
                      </div>

                      <h6 class="mb-2">Order Items</h6>

                      <div v-if="!order.details?.length" class="text-muted">
                        No items found for this order.
                      </div>

                      <div v-else class="d-grid gap-3">
                        <div
                          v-for="detail in order.details"
                          :key="detail.id"
                          class="order-item-row"
                        >
                          <div class="d-flex gap-3 align-items-start">
                            <div class="thumb-wrap">
                              <img
                                v-if="getImageThumbnailUrl(detail.tblItems)"
                                :src="getImageThumbnailUrl(detail.tblItems)"
                                :alt="detail.tblItems?.ItemDescription || `Item #${detail.itemNumber}`"
                                class="thumb-image"
                              />
                              <div v-else class="thumb-placeholder text-muted small">
                                No image
                              </div>
                            </div>

                            <div class="flex-grow-1 min-w-0">
                              <div class="fw-semibold">
                                {{ detail.tblItems?.ItemDescription || `Item #${detail.itemNumber}` }}
                              </div>
                              <div class="small text-muted">
                                Item Number: {{ detail.itemNumber }}
                              </div>
                            </div>

                            <div class="text-end fw-semibold">
                              {{ formatCurrency(detail.tblItems?.ItemAskingPrice) }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-end mt-3">
          <button class="btn btn-outline-secondary" @click="goViewAvailable">
            View Available Items
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import APIService from "@/api/APIService";
import { useAuthStore } from "@/store/AuthStore";

export default {
  name: "MyOrders",

  data() {
    return {
      authStore: null,
      loading: false,
      errorMessage: "",
      orders: [],
      expandedOrders: {},
    };
  },

  created() {
    this.authStore = useAuthStore();
    this.loadOrders();
  },

  methods: {
    async loadOrders() {
      if (this.loading) return;

      this.errorMessage = "";
      this.loading = true;

      try {
        if (!this.authStore?.isAuthenticated || !this.authStore?.userId) {
          this.$router.push("/login");
          return;
        }

        const orders = await APIService.getMyOrders(this.authStore.userId);
        this.orders = Array.isArray(orders) ? orders : [];

        const validOrderNums = new Set(this.orders.map((order) => order.orderNum));
        this.expandedOrders = Object.fromEntries(
          Object.entries(this.expandedOrders).filter(([orderNum]) =>
            validOrderNums.has(Number(orderNum))
          )
        );
      } catch (error) {
        this.errorMessage = error?.message || "Failed to load your orders.";
      } finally {
        this.loading = false;
      }
    },

    toggleOrderDetails(orderNum) {
      this.expandedOrders = {
        ...this.expandedOrders,
        [orderNum]: !this.expandedOrders[orderNum],
      };
    },

    formatCurrency(value) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(value) || 0);
    },

    formatDate(dateValue) {
      if (!dateValue) return "";

      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(dateValue));
    },

    getImageThumbnailUrl(item) {
      return APIService.getImageThumbnailUrl(item);
    },

    getStatusLabel(status) {
      return {
        P: "Pending",
        DP: "Delivery Pending",
        D: "Delivered",
      }[status] || status;
    },

    goHome() {
      this.$router.push("/");
    },

    continueShopping() {
      this.$router.push("/availableItems");
    },
  },
};
</script>

<style scoped>
.order-table th,
.order-table td {
  vertical-align: middle;
}

.details-row td {
  background: #f8f9fa;
}

.order-item-row {
  border: 1px solid #dee2e6;
  border-radius: 0.65rem;
  padding: 0.75rem;
  background: #fff;
}

.thumb-wrap {
  width: 64px;
  height: 64px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>