<template>
  <div class="container py-4 list-items-page">
    <div class="d-flex align-items-center justify-content-between gap-3 mb-4 flex-wrap">
      <div class="d-flex align-items-center gap-3 flex-wrap">
        <label for="categorySelect" class="fw-semibold mb-0">View Items by Category:</label>
        <select id="categorySelect" v-model="selectedCategory" class="form-select w-auto"
          @change="handleCategoryChange">
          <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <span>
          Showing {{ startItem }} - {{ endItem }} of {{ items.length }} items
        </span>
      </div>

      <div class="d-flex align-items-center gap-2 flex-wrap">
        <button type="button" class="btn btn-primary" @click="addNewItem">
          Add New Item
        </button>

        <input v-model="searchItemNumber" type="number" class="form-control item-number-search"
          placeholder="Enter Item #" @keyup.enter="findByItemNumber" />
        <button type="button" class="btn btn-outline-primary" @click="findByItemNumber">
          Find
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="clearSearch">
          Clear Search
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-4">
      Loading items...
    </div>

    <div v-else-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </div>

    <div v-else>
      <div v-if="items.length === 0" class="alert alert-info">
        No items found.
      </div>

      <div v-else>
        <div class="table-responsive">
          <table class="table table-striped table-hover align-middle sortable-table">
            <thead>
              <tr>
                <th v-for="header in headers" :key="header" @click="sortBy(header)" class="sortable-header text-center">
                  <div class="th-content justify-content-center">
                    <span class="header-label">{{ headerLabels[header] || header }}</span>
                    <span class="sort-icon-slot">
                      <i v-if="sortKey === header && sortDirection === 'asc'" class="bi bi-caret-up-fill"></i>
                      <i v-else-if="sortKey === header && sortDirection === 'desc'" class="bi bi-caret-down-fill"></i>
                    </span>
                  </div>
                </th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in paginatedItems" :key="item.ItemNumber">
                <td v-for="header in headers" :key="`${item.ItemNumber}-${header}`"
                  :class="{ 'text-center': ['ItemStatus', 'ItemNumber'].includes(header) }">
                  <button v-if="header === 'ItemNumber'" type="button"
                    class="btn btn-link p-0 text-decoration-underline" @click="viewItemDetail(item)">
                    {{ item[header] }}
                  </button>

                  <img v-else-if="header === 'ItemImage' && item[header]" :src="getImageUrl(item)" alt="Item Image"
                    class="img-thumbnail" style="width: 75px; height: 75px; object-fit: cover;" />

                  <span v-else-if="['ItemAskingPrice', 'ItemCost'].includes(header)">
                    {{ formatCurrency(item[header]) }}
                  </span>

                  <span v-else>
                    {{ item[header] }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="d-inline-flex gap-2">
                    <button type="button" class="btn btn-sm btn-outline-primary" @click="editItem(item)"
                      title="Edit Item">
                      <i class="bi bi-pencil-fill"></i>
                    </button>

                    <button type="button" class="btn btn-sm btn-outline-danger" @click="confirmDelete(item)"
                      title="Delete Item">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
          <nav aria-label="Items pagination">
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button type="button" class="page-link" @click="goToPreviousPage" :disabled="currentPage === 1">
                  Previous
                </button>
              </li>

              <li v-for="(page, index) in visiblePages" :key="`${page}-${index}`" class="page-item"
                :class="{ active: currentPage === page, disabled: page === '...' }">
                <button v-if="page !== '...'" type="button" class="page-link" @click="goToPage(page)">
                  {{ page }}
                </button>

                <span v-else class="page-link">
                  ...
                </span>
              </li>

              <li class="page-item" :class="{ disabled: currentPage === totalPages || totalPages === 0 }">
                <button type="button" class="page-link" @click="goToNextPage"
                  :disabled="currentPage === totalPages || totalPages === 0">
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import APIService from "@/api/APIService";
import { useAuthStore } from "@/store/AuthStore";

export default {
  name: "ItemList",

  data() {
    return {
      allItems: [],
      items: [],
      selectedCategory: "A",
      searchItemNumber: "",
      categoryOptions: [
        { value: "A", label: "Available" },
        { value: "S", label: "Sold" },
        { value: "R", label: "Replace" },
        { value: "K", label: "Kept" },
        { value: "All", label: "All" },
      ],
      loading: true,
      errorMessage: "",
      currentPage: 1,
      itemsPerPage: 15,
      auth: null,
      sortKey: "",
      sortDirection: "asc",

      headerLabels: {
        ItemNumber: "#",
        ItemType: "Type",
        ItemSubType: "Sub-type",
        ItemAskingPrice: "Price",
        ItemImage: "Image",
        ItemStatus: "Status",
        ItemColor: "Colors",
        ItemCost: "Cost",
        ItemDescription: "Description",
      },
    };
  },

  computed: {
    headers() {
      if (!this.items.length) return [];
      return Object.keys(this.items[0]);
    },

    visiblePages() {
      if (this.totalPages <= 20) {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
      }

      const pages = [1];
      const start = Math.max(2, this.currentPage - 2);
      const end = Math.min(this.totalPages - 1, this.currentPage + 2);

      if (start > 2) {
        pages.push("...");
      }

      for (let page = start; page <= end; page++) {
        pages.push(page);
      }

      if (end < this.totalPages - 1) {
        pages.push("...");
      }

      pages.push(this.totalPages);

      return pages;
    },

    totalPages() {
      return Math.ceil(this.items.length / this.itemsPerPage);
    },

    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.sortedItems.slice(start, end);
    },

    startItem() {
      if (this.items.length === 0) return 0;
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },

    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.items.length);
    },

    sortedItems() {
      if (!this.sortKey) return this.items;

      return [...this.items].sort((a, b) => {
        let valA = a[this.sortKey];
        let valB = b[this.sortKey];

        if (!isNaN(valA) && !isNaN(valB)) {
          valA = Number(valA);
          valB = Number(valB);
        } else {
          valA = String(valA).toLowerCase();
          valB = String(valB).toLowerCase();
        }

        if (valA < valB) return this.sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return this.sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    },
  },

  methods: {
    async loadItems() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const data = await APIService.getItems();
        this.allItems = Array.isArray(data) ? data : [];
        this.currentPage = 1;
        this.selectedCategory = "All";
        this.searchItemNumber = "";
        this.handleCategoryChange();
      } catch (error) {
        this.errorMessage = error.message || "Failed to load items.";
      } finally {
        this.loading = false;
      }
    },
    findByItemNumber() {
      const itemNumber = Number(this.searchItemNumber);

      if (!this.searchItemNumber || Number.isNaN(itemNumber)) {
        // reset to current category filter
        this.handleCategoryChange();
        return;
      }

      this.items = this.allItems.filter(
        (item) => Number(item.ItemNumber) === itemNumber
      );

      this.currentPage = 1;
    },
    clearSearch() {
      this.searchItemNumber = "";
      this.handleCategoryChange();
    },
    addNewItem() {
      const maxItemNumber = this.allItems.length
        ? Math.max(...this.allItems.map((item) => Number(item.ItemNumber) || 0))
        : 0;

      const nextItemNumber = maxItemNumber + 1;

      this.$router.push(`/editItem?itemNumber=${nextItemNumber}`);
    },
    viewItemDetail(item) {
      this.$router.push(`/itemDetail/${item.ItemNumber}`);
    },
    editItem(item) {
      this.$router.push(`/editItem/${item.ItemNumber}`);
    },

    handleCategoryChange() {
      this.searchItemNumber = "";
      if (this.selectedCategory === "All") {
        this.items = this.allItems;
      } else if (this.selectedCategory === "ItemNumber") {
        const itemNumber = Number(this.searchItemNumber);

        if (!this.searchItemNumber || Number.isNaN(itemNumber)) {
          this.items = [];
        } else {
          this.items = this.allItems.filter(
            (item) => Number(item.ItemNumber) === itemNumber
          );
        }
      } else {
        this.items = this.allItems.filter(
          (item) => item.ItemStatus === this.selectedCategory
        );
      }

      this.currentPage = 1;
    },

    getImageUrl(item) {
      return APIService.getImageUrl(item);
    },

    sortBy(key) {
      if (key === "ItemImage") return;

      if (this.sortKey === key) {
        this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
      } else {
        this.sortKey = key;
        this.sortDirection = "asc";
      }

      this.currentPage = 1;
    },

    formatCurrency(value) {
      if (value == null || value === "") return "";

      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    },

    goToPage(page) {
      this.currentPage = page;
    },

    goToPreviousPage() {
      if (this.currentPage > 1) {
        this.currentPage -= 1;
      }
    },

    goToNextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage += 1;
      }
    },

    async confirmDelete(item) {
      const ok = window.confirm(
        `Are you sure you want to delete item #${item.ItemNumber}?`
      );

      if (!ok) return;

      try {
        await APIService.deleteItem(item.ItemNumber);
        await this.loadItems();

        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = this.totalPages;
        }
      } catch (error) {
        window.alert(error.message || "Delete failed.");
      }
    },
  },

  async mounted() {
    this.auth = useAuthStore();

    if (!this.auth.isAuthenticated) {
      window.alert("You must be logged in to view items.");
      this.$router.push("/");
      return;
    }

    await this.loadItems();
  },
};
</script>

<style scoped>
.sortable-table {
  table-layout: auto;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
}

.sortable-header {
  cursor: pointer;
  user-select: none;
  vertical-align: middle;
}

.sort-icon-slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  min-width: 1.25rem;
}

.not-sortable {
  cursor: default;
}

.header-label {
  display: inline-block;
  white-space: nowrap;
}

.list-items-page {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.item-number-search {
  max-width: 140px;
}
</style>