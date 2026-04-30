<template>
    <div class="container py-4 admin-orders-page">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div>
                <h2 class="mb-1">All Orders</h2>
                <p class="text-muted mb-0">
                    View and manage all customer orders.
                </p>
            </div>

            <div class="d-flex gap-2 flex-wrap">
                <button type="button" class="btn btn-outline-secondary" @click="loadOrders" :disabled="loading">
                    {{ loading ? "Refreshing..." : "Refresh" }}
                </button>
            </div>
        </div>

        <div class="card shadow-sm mb-4">
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-4">
                        <label class="form-label">Search</label>
                        <input v-model.trim="searchText" type="text" class="form-control"
                            placeholder="Order #, email, name, phone" />
                    </div>

                    <div class="col-md-3">
                        <label class="form-label">Status</label>
                        <select v-model="statusFilter" class="form-select">
                            <option value="">All</option>
                            <option value="P">Pending</option>
                            <option value="DP">Delivery Pending</option>
                            <option value="D">Delivered</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="loading" class="alert alert-info" role="alert">
            Loading orders...
        </div>

        <div v-else-if="errorMessage" class="alert alert-danger" role="alert">
            {{ errorMessage }}
        </div>

        <div v-else-if="!groupedOrders.length" class="alert alert-secondary" role="alert">
            No orders found.
        </div>

        <div v-else class="d-grid gap-4">
            <div v-for="group in groupedOrders" :key="group.userKey" class="card shadow-sm user-group-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                        <div>
                            <h4 class="mb-1">{{ group.displayName }}</h4>
                            <div class="text-muted small">{{ group.email || "No email" }}</div>
                            <div class="text-muted small">Phone: {{ group.phone || "N/A" }}</div>
                        </div>

                        <div class="text-end">
                            <div><strong>Orders:</strong> {{ group.orders.length }}</div>
                            <div><strong>Total Value:</strong> {{ formatCurrency(group.totalValue) }}</div>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-sm table-striped align-middle order-table mb-0">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Placed</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>City</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th style="width: 170px;">Change Status</th>
                                    <th style="width: 120px;">Details</th>
                                    <th style="width: 120px;">Delete</th>
                                </tr>
                            </thead>

                            <tbody>
                                <template v-for="order in group.orders" :key="order.orderNum">
                                    <tr>
                                        <td>{{ order.orderNum }}</td>
                                        <td>{{ formatDate(order.created_at) }}</td>
                                        <td>{{ order.custFirstName }} {{ order.custLastName }}</td>
                                        <td>{{ order.orderEmail }}</td>
                                        <td>{{ order.orderPhone }}</td>
                                        <td>{{ order.orderCity }}</td>
                                        <td>{{ order.orderTotalItems }}</td>
                                        <td>{{ formatCurrency(order.orderTotal) }}</td>
                                        <td>{{ getStatusLabel(order.orderStatus) }}</td>
                                        <td>
                                            <select class="form-select form-select-sm" :value="order.orderStatus || 'P'"
                                                @change="updateOrderStatus(order, $event.target.value)"
                                                :disabled="savingOrderNum === order.orderNum">
                                                <option value="P">Pending</option>
                                                <option value="DP">Delivery Pending</option>
                                                <option value="D">Delivered</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button type="button" class="btn btn-outline-primary btn-sm"
                                                @click="toggleOrderDetails(order.orderNum)">
                                                {{ expandedOrders[order.orderNum] ? "Hide Details" : "Order Details" }}
                                            </button>
                                        </td>
                                        <td>
                                            <button type="button" class="btn btn-outline-danger btn-sm"
                                                @click="confirmDeleteOrder(order)"
                                                :disabled="deletingOrderNum === order.orderNum">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>

                                    <tr v-if="expandedOrders[order.orderNum]" class="details-row">
                                        <td colspan="12">
                                            <div class="p-2">
                                                <div class="row g-3 mb-3">
                                                    <div class="col-md-6">
                                                        <label class="form-label">First Name</label>
                                                        <input
                                                            v-model.trim="editableOrders[order.orderNum].custFirstName"
                                                            type="text" class="form-control form-control-sm" />
                                                    </div>

                                                    <div class="col-md-6">
                                                        <label class="form-label">Last Name</label>
                                                        <input
                                                            v-model.trim="editableOrders[order.orderNum].custLastName"
                                                            type="text" class="form-control form-control-sm" />
                                                    </div>

                                                    <div class="col-md-6">
                                                        <label class="form-label">Phone</label>
                                                        <input v-model.trim="editableOrders[order.orderNum].orderPhone"
                                                            type="text" class="form-control form-control-sm" />
                                                    </div>

                                                    <div class="col-md-6">
                                                        <label class="form-label">City</label>
                                                        <input v-model.trim="editableOrders[order.orderNum].orderCity"
                                                            type="text" class="form-control form-control-sm" />
                                                    </div>

                                                    <div class="col-12">
                                                        <label class="form-label">Street Address</label>
                                                        <input
                                                            v-model.trim="editableOrders[order.orderNum].orderStreetAddress"
                                                            type="text" class="form-control form-control-sm" />
                                                    </div>
                                                </div>

                                                <div class="d-flex justify-content-end mb-4">
                                                    <button type="button" class="btn btn-outline-success btn-sm"
                                                        @click="saveOrderAddress(order)"
                                                        :disabled="savingAddressOrderNum === order.orderNum">
                                                        Save Address
                                                    </button>
                                                </div>

                                                <div class="card border-0 shadow-sm mb-3">
                                                    <div class="card-body">
                                                        <h6 class="mb-3">Add Item</h6>
                                                        <div class="row g-2 align-items-end">
                                                            <div class="col-md-6">
                                                                <label class="form-label">Available Item</label>
                                                                <select v-model="newItemNumbers[order.orderNum]"
                                                                    class="form-select form-select-sm">
                                                                    <option value="">Select an available item</option>
                                                                    <option v-for="item in availableItems"
                                                                        :key="item.ItemNumber" :value="item.ItemNumber">
                                                                        #{{ item.ItemNumber }} - {{ item.ItemDescription
                                                                        }} - {{ formatCurrency(item.ItemAskingPrice) }}
                                                                    </option>
                                                                </select>
                                                            </div>
                                                            <div class="col-md-3">
                                                                <button type="button" class="btn btn-primary btn-sm"
                                                                    @click="addItemToOrder(order)"
                                                                    :disabled="addingItemOrderNum === order.orderNum || !newItemNumbers[order.orderNum]">
                                                                    Add Item
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <h6 class="mb-2">Order Items</h6>

                                                <div v-if="!order.details || !order.details.length" class="text-muted">
                                                    No items found for this order.
                                                </div>

                                                <div v-else class="table-responsive">
                                                    <table class="table table-bordered table-sm mb-0">
                                                        <thead>
                                                            <tr>
                                                                <th>Item Number</th>
                                                                <th>Description</th>
                                                                <th>Price</th>
                                                                <th style="width: 120px;">Remove</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr v-for="detail in order.details" :key="detail.id">
                                                                <td>{{ detail.itemNumber }}</td>
                                                                <td>
                                                                    {{ detail.tblItems?.ItemDescription || `Item
                                                                    #${detail.itemNumber}` }}
                                                                </td>
                                                                <td>
                                                                    {{ formatCurrency(detail.tblItems?.ItemAskingPrice)
                                                                    }}
                                                                </td>
                                                                <td>
                                                                    <button type="button"
                                                                        class="btn btn-outline-danger btn-sm"
                                                                        @click="confirmRemoveItem(order, detail)"
                                                                        :disabled="removingDetailId === detail.id">
                                                                        Remove
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <div class="mt-3 small text-muted">
                                                    Removing an item sets its item status to AW.
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>

                    <div class="d-flex justify-content-end mt-3">
                        <button type="button" class="btn btn-outline-secondary" @click="goViewAvailable">
                            View Available Items
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import APIService from "@/api/APIService";
import { useAuthStore } from "@/store/AuthStore";
import { useItemStore } from "@/store/ItemStore";

export default {
    name: "AdminOrders",

    data() {
        return {
            authStore: null,
            loading: false,
            errorMessage: "",
            savingOrderNum: null,
            savingAddressOrderNum: null,
            deletingOrderNum: null,
            addingItemOrderNum: null,
            removingDetailId: null,
            orders: [],
            availableItems: [],
            searchText: "",
            statusFilter: "",
            expandedOrders: {},
            editableOrders: {},
            newItemNumbers: {},
            itemStore: null,
        };
    },

    computed: {
        filteredOrders() {
            const search = this.searchText.trim().toLowerCase();

            return this.orders.filter((order) => {
                const matchesStatus =
                    !this.statusFilter || (order.orderStatus || "P") === this.statusFilter;

                if (!matchesStatus) return false;
                if (!search) return true;

                const OrderInfo = [
                    order.orderNum,
                    order.user_id,
                    order.orderEmail,
                    order.custFirstName,
                    order.custLastName,
                    order.orderPhone,
                    order.orderCity,
                    order.orderStreetAddress,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return OrderInfo.includes(search);
            });
        },

        groupedOrders() {
            const groups = this.filteredOrders.reduce((acc, order) => {
                const userKey = order.user_id || `guest-${order.orderEmail || order.orderNum}`;

                if (!acc[userKey]) {
                    acc[userKey] = {
                        userKey,
                        userId: order.user_id || "",
                        displayName:
                            `${order.custFirstName || ""} ${order.custLastName || ""}`.trim() ||
                            "Unknown User",
                        email: order.orderEmail || "",
                        phone: order.orderPhone || "",
                        totalValue: 0,
                        orders: [],
                    };
                }

                acc[userKey].orders.push(order);
                acc[userKey].totalValue += Number(order.orderTotal || 0);

                return acc;
            }, {});

            return Object.values(groups).sort((a, b) => {
                const aKey = (a.userId || a.email || "").toLowerCase();
                const bKey = (b.userId || b.email || "").toLowerCase();
                return aKey.localeCompare(bKey);
            });
        },
    },

    methods: {
        async loadOrders() {
            this.loading = true;
            this.errorMessage = "";

            try {
                if (!this.authStore?.isAuthenticated) {
                    this.$router.push("/login");
                    return;
                }

                if (this.authStore?.usertype !== "admin") {
                    this.errorMessage = "You are not authorized to view this page.";
                    return;
                }

                const [orders, availableItems] = await Promise.all([
                    APIService.getAllOrders(),
                    this.itemStore.fetchItemsByStatus("AW"),
                ]);

                this.orders = Array.isArray(orders) ? orders : [];
                this.availableItems = Array.isArray(availableItems) ? availableItems : [];
                this.initializeEditableOrders();
            } catch (error) {
                console.error("Failed to load admin orders:", error);
                this.errorMessage = error.message || "Failed to load orders.";
            } finally {
                this.loading = false;
            }
        },

        initializeEditableOrders() {
            const editable = {};
            const newItemNumbers = {};

            for (const order of this.orders) {
                editable[order.orderNum] = {
                    custFirstName: order.custFirstName || "",
                    custLastName: order.custLastName || "",
                    orderPhone: order.orderPhone || "",
                    orderCity: order.orderCity || "",
                    orderStreetAddress: order.orderStreetAddress || "",
                };

                newItemNumbers[order.orderNum] = "";
            }

            this.editableOrders = editable;
            this.newItemNumbers = newItemNumbers;
        },

        toggleOrderDetails(orderNum) {
            this.expandedOrders = {
                ...this.expandedOrders,
                [orderNum]: !this.expandedOrders[orderNum],
            };
        },

        async updateOrderStatus(order, newStatus) {
            const oldStatus = order.orderStatus || "P";
            if (newStatus === oldStatus) return;

            this.savingOrderNum = order.orderNum;
            this.errorMessage = "";

            try {
                const updated = await APIService.updateCustomerOrder(order.orderNum, {
                    orderStatus: newStatus,
                });

                order.orderStatus = updated?.orderStatus || newStatus;
            } catch (error) {
                console.error("Failed to update order:", error);
                this.errorMessage = error.message || "Failed to update order status.";
                order.orderStatus = oldStatus;
            } finally {
                this.savingOrderNum = null;
            }
        },

        async saveOrderAddress(order) {
            const payload = this.editableOrders[order.orderNum];
            if (!payload) return;

            this.savingAddressOrderNum = order.orderNum;
            this.errorMessage = "";

            try {
                const updated = await APIService.updateOrderAddress(order.orderNum, payload);

                order.custFirstName = updated.custFirstName;
                order.custLastName = updated.custLastName;
                order.orderPhone = updated.orderPhone;
                order.orderCity = updated.orderCity;
                order.orderStreetAddress = updated.orderStreetAddress;
            } catch (error) {
                console.error("Failed to save address:", error);
                this.errorMessage = error.message || "Failed to update order address.";
            } finally {
                this.savingAddressOrderNum = null;
            }
        },

        async addItemToOrder(order) {
            const itemNumber = this.newItemNumbers[order.orderNum];

            if (!itemNumber) {
                this.errorMessage = "Select an item to add.";
                return;
            }

            this.addingItemOrderNum = order.orderNum;
            this.errorMessage = "";

            try {
                const result = await APIService.addItemAndSyncOrder(order.orderNum, itemNumber);

                order.details = result.details || [];
                order.orderTotal = result.orderTotal || 0;
                order.orderTotalItems = result.orderTotalItems || 0;

                this.newItemNumbers[order.orderNum] = "";
                this.itemStore.clearCache();
                this.availableItems = await this.itemStore.fetchItemsByStatus("AW", true);
            } catch (error) {
                console.error("Failed to add item:", error);
                this.errorMessage = error.message || "Failed to add item to order.";
            } finally {
                this.addingItemOrderNum = null;
            }
        },
        async confirmRemoveItem(order, detail) {
            const ok = window.confirm(
                `Remove item #${detail.itemNumber} from order #${order.orderNum}?`
            );

            if (!ok) return;

            this.removingDetailId = detail.id;
            this.errorMessage = "";

            try {
                const result = await APIService.removeItemAndSyncOrder(order.orderNum, detail);

                if (result.deletedOrder) {
                    this.orders = this.orders.filter((o) => o.orderNum !== order.orderNum);
                    delete this.expandedOrders[order.orderNum];
                    delete this.editableOrders[order.orderNum];
                    delete this.newItemNumbers[order.orderNum];
                    this.itemStore.clearCache();
                    this.availableItems = await this.itemStore.fetchItemsByStatus("AW", true);
                    return;
                }

                order.details = result.details || [];
                order.orderTotal = result.orderTotal || 0;
                order.orderTotalItems = result.orderTotalItems || 0;
                this.itemStore.clearCache();
                this.availableItems = await this.itemStore.fetchItemsByStatus("AW", true);
            } catch (error) {
                console.error("Failed to remove item:", error);
                this.errorMessage = error.message || "Failed to remove item from order.";
            } finally {
                this.removingDetailId = null;
            }
        },

        async confirmDeleteOrder(order) {
            const ok = window.confirm(
                `Delete order #${order.orderNum}? This will remove the order and set all its items to AW.`
            );

            if (!ok) return;

            this.deletingOrderNum = order.orderNum;
            this.errorMessage = "";

            try {
                await APIService.deleteCustomerOrder(order.orderNum);
                this.orders = this.orders.filter((o) => o.orderNum !== order.orderNum);
                delete this.expandedOrders[order.orderNum];
                delete this.editableOrders[order.orderNum];
                delete this.newItemNumbers[order.orderNum];
                this.itemStore.clearCache();
                this.availableItems = await this.itemStore.fetchItemsByStatus("AW", true);
            } catch (error) {
                console.error("Failed to delete order:", error);
                this.errorMessage = error.message || "Failed to delete order.";
            } finally {
                this.deletingOrderNum = null;
            }
        },

        formatCurrency(value) {
            if (value == null || value === "") return "";
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

        getStatusLabel(status) {
            const map = {
                P: "Pending",
                DP: "Delivery Pending",
                D: "Delivered",
            };

            return map[status] || status || "";
        },

        goViewAvailable() {
            this.$router.push("/availableItems");
        },
    },

    created() {
        
        this.authStore = useAuthStore();
        this.itemStore = useItemStore();
        this.loadOrders();
    },
};
</script>

<style scoped>
.admin-orders-page {
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.user-group-card {
    border-left: 4px solid #6c757d;
}

.order-table th,
.order-table td {
    vertical-align: middle;
}

.details-row td {
    background: #f8f9fa;
}

@media (max-width: 991.98px) {
    .order-table {
        font-size: 0.9rem;
    }
}
</style>