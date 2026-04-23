<template>
    <div class="container viewCart-page py-4">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4 p-3 rounded bg-white bg-opacity-75 shadow-sm">
            <div>
                <h2 class="mb-1">Shopping Cart</h2>
                <p class="text mb-1">Review the items you have added to your cart.</p>
                
                <p class="text mb-0">You will be contacted shortly to complete your purchase and schedule delivery.</p>
                
                <p class="text mb-0">Omaha Area Delivery Only.</p>
            </div>

            <div v-if="cartCount > 0" class="d-flex align-items-center gap-2 flex-wrap">
                <span class="badge bg-secondary fs-6">
                    {{ cartCount }} item<span v-if="cartCount !== 1">s</span>
                </span>
                <span class="badge bg-dark fs-6">
                    Total: {{ formatCurrency(cartTotal) }}
                </span>
            </div>
        </div>

        <div v-if="!cartItems.length" class="alert alert-info" role="alert">
            Your cart is empty.
        </div>

        <div v-else>
            <!-- Mobile card view -->
            <div class="d-md-none d-grid gap-3">
                <div v-for="item in cartItems" :key="item.ItemNumber" class="card shadow-sm cart-card">
                    <div class="card-body p-3">
                        <div class="d-flex gap-3">
                            <div class="thumb-wrap">
                                <img v-if="getImageThumbnailUrl(item)" :src="getImageThumbnailUrl(item)"
                                    :alt="`Item ${item.ItemNumber}`" class="thumb-image" />
                                <div v-else class="thumb-placeholder text-muted small">
                                    No image
                                </div>
                            </div>

                            <div class="flex-grow-1 min-w-0">
                                <div class="text-muted small">Item Number</div>
                                <div class="fw-semibold mb-2">{{ item.ItemNumber }}</div>
                                <div class="small mb-1"><span class="text-muted fw-semibold">Type:</span> {{
                                    item.ItemType || "" }}</div>
                                <div class="small mb-1"><span class="text-muted fw-semibold">Sub-type:</span> {{
                                    item.ItemSubType || "" }}</div>
                                <div class="small mb-1"><span class="text-muted fw-semibold">Color:</span> {{
                                    item.ItemColor || "" }}</div>
                                <div class="small mb-1"><span class="text-muted fw-semibold">Price:</span> {{
                                    formatCurrency(item.ItemAskingPrice) }}</div>
                                <div class="small text-muted mt-2">{{ item.ItemDescription || "" }}</div>
                            </div>
                        </div>

                        <div class="d-grid gap-2 mt-3">
                            <button type="button" class="btn btn-sm btn-outline-secondary" @click="viewItem(item)">
                                View Details
                            </button>
                            <button type="button" class="btn btn-sm btn-danger"
                                @click="removeFromCart(item.ItemNumber)">
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Desktop table view -->
            <div class="d-none d-md-block">
                <div class="card shadow-sm">
                    <div class="table-responsive">
                        <table class="table align-middle mb-0 cart-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Item #</th>
                                    <th>Type</th>
                                    <th>Sub-type</th>
                                    <th>Color</th>
                                    <th class="text-end">Price</th>
                                    <th>Description</th>
                                    <th class="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in cartItems" :key="item.ItemNumber">
                                    <td>
                                        <div class="table-thumb-wrap">
                                            <img v-if="getImageThumbnailUrl(item)" :src="getImageThumbnailUrl(item)"
                                                :alt="`Item ${item.ItemNumber}`" class="table-thumb-image" />
                                            <div v-else class="table-thumb-placeholder text-muted small">
                                                No image
                                            </div>
                                        </div>
                                    </td>
                                    <td class="fw-semibold">{{ item.ItemNumber }}</td>
                                    <td>{{ item.ItemType || "" }}</td>
                                    <td>{{ item.ItemSubType || "" }}</td>
                                    <td>{{ item.ItemColor || "" }}</td>
                                    <td class="text-end">{{ formatCurrency(item.ItemAskingPrice) }}</td>
                                    <td>
                                        <div class="description-cell">{{ item.ItemDescription || "" }}</div>
                                    </td>
                                    <td>
                                        <div class="d-flex justify-content-end gap-2 flex-wrap">
                                            <button type="button" class="btn btn-sm btn-outline-secondary"
                                                @click="viewItem(item)">
                                                View
                                            </button>
                                            <button type="button" class="btn btn-sm btn-danger"
                                                @click="removeFromCart(item.ItemNumber)">
                                                Remove
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="d-flex justify-content-end flex-wrap gap-2 mt-4">
                <button type="button" class="btn btn-secondary" @click="continueShopping">
                    Continue Shopping
                </button>
                <button type="button" class="btn btn-danger" @click="clearCart">
                    Clear Cart
                </button>
                <button type="button" class="btn btn-primary" @click="checkout" :disabled="!cartCount">
                    Checkout
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import APIService from "@/api/APIService";
import { useCartStore } from "@/store/CartStore";

export default {
    name: "CartView",

    data() {
        return {
            cartStore: null,
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
        getImageThumbnailUrl(item) {
            return APIService.getImageThumbnailUrl(item);
        },

        removeFromCart(itemNumber) {
            this.cartStore.removeFromCart(itemNumber);
        },

        clearCart() {
            const ok = window.confirm("Clear all items from your cart?");
            if (!ok) return;
            this.cartStore.clearCart();
        },

        continueShopping() {
            this.$router.push("/availableItems");
        },

        viewItem(item) {
            this.$router.push({
                path: `/itemDetail/${item.ItemNumber}`,
            });
        },

        checkout() {
            this.$router.push("/place-order");
        },

        formatCurrency(value) {
            if (value == null || value === "") return "";

            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(value);
        },
    },

    created() {
        this.cartStore = useCartStore();
    },
};
</script>

<style scoped>
.viewCart-page {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
.cart-card {
    border: 1px solid #dee2e6;
    border-radius: 0.75rem;
}

.thumb-wrap {
    width: 88px;
    height: 88px;
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
    padding: 0.5rem;
}

.table-thumb-wrap {
    width: 72px;
    height: 72px;
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.table-thumb-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.table-thumb-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0.35rem;
}

.cart-table th,
.cart-table td {
    vertical-align: middle;
}

.description-cell {
    max-width: 240px;
    white-space: pre-wrap;
    word-break: break-word;
}
</style>
