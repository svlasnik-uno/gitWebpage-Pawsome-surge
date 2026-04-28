<template>
  <div class="container py-4 list-items-page bg-white shadow-sm rounded px-4">
    <div class="d-flex align-items-center justify-content-between gap-3 mb-4 flex-wrap">
      <div class="d-flex align-items-center gap-3 flex-wrap">
        <label for="categorySelect" class="fw-semibold mb-0">View Items by Category:</label>
        <select
          id="categorySelect"
          v-model="selectedCategory"
          class="form-select w-auto"
          @change="handleFilterChange"
        >
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <label for="subTypeSelect" class="fw-semibold mb-0">View Items by Sub-type:</label>
        <select
          id="subTypeSelect"
          v-model="selectedSubType"
          class="form-select w-auto"
          @change="handleFilterChange"
        >
          <option v-for="option in subTypeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <span>
          Showing {{ startItem }} - {{ endItem }} of {{ filteredItems.length }} items
        </span>
      </div>

      <div class="d-flex align-items-center gap-2 flex-wrap">
        <select v-model="searchField" class="form-select search-field-select">
          <option value="ItemNumber">Item Number</option>
          <option value="ItemDescription">Item Description</option>
        </select>

        <input
          v-model.trim="searchValue"
          type="text"
          class="form-control item-search-input"
          :placeholder="searchField === 'ItemNumber' ? 'Find Item #' : 'Find Item Description'"
          @keyup.enter="findItems"
        />

        <button type="button" class="btn btn-secondary" @click="findItems">
          Find
        </button>

        <button type="button" class="btn btn-secondary" @click="clearSearch">
          Clear Search
        </button>

        <button type="button" class="btn btn-secondary" @click="addNewItem">
          Add New Item
        </button>

        <button type="button" class="btn btn-secondary" @click="goToCreatePdfReport">
          Create PDF Report
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
      <div v-if="filteredItems.length === 0" class="alert alert-info">
        No items found.
      </div>

      <div v-else>
        <div class="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
          <nav aria-label="Items pagination">
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button
                  type="button"
                  class="page-link"
                  @click="goToPreviousPage"
                  :disabled="currentPage === 1"
                >
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>

              <li
                v-for="(page, index) in visiblePages"
                :key="`${page}-${index}`"
                class="page-item"
                :class="{ active: currentPage === page, disabled: page === '...' }"
              >
                <button
                  v-if="page !== '...'"
                  type="button"
                  class="page-link"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>

                <span v-else class="page-link">
                  ...
                </span>
              </li>

              <li class="page-item" :class="{ disabled: currentPage === totalPages || totalPages === 0 }">
                <button
                  type="button"
                  class="page-link"
                  @click="goToNextPage"
                  :disabled="currentPage === totalPages || totalPages === 0"
                >
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div class="table-responsive d-none d-md-block">
          <table class="table table-striped table-hover align-middle sortable-table">
            <thead>
              <tr>
                <th
                  v-for="header in headers"
                  :key="header"
                  @click="sortBy(header)"
                  :class="[
                    'text-center',
                    header === 'ItemImage' ? 'not-sortable' : 'sortable-header'
                  ]"
                >
                  <div class="th-content justify-content-center">
                    <span class="header-label">{{ headerLabels[header] || header }}</span>
                    <span class="sort-icon-slot">
                      <i
                        v-if="sortKey === header && sortDirection === 'asc'"
                        class="bi bi-caret-up-fill"
                      ></i>
                      <i
                        v-else-if="sortKey === header && sortDirection === 'desc'"
                        class="bi bi-caret-down-fill"
                      ></i>
                    </span>
                  </div>
                </th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in paginatedItems" :key="item.ItemNumber">
                <td
                  v-for="header in headers"
                  :key="`${item.ItemNumber}-${header}`"
                  :class="{ 'text-center': ['ItemStatus', 'ItemNumber'].includes(header) }"
                >
                  <button
                    v-if="header === 'ItemNumber'"
                    type="button"
                    class="btn btn-link p-0 text-decoration-underline"
                    @click="viewItemDetail(item)"
                  >
                    {{ item[header] }}
                  </button>

                  <img
                    v-else-if="header === 'ItemImage' && item[header]"
                    :src="getImageThumbnailUrl(item)"
                    alt="Item Image"
                    class="img-thumbnail"
                    loading="lazy"
                    decoding="async"
                    style="width: 75px; height: 75px; object-fit: cover;"
                  />

                  <span v-else-if="['ItemAskingPrice', 'ItemCost'].includes(header)">
                    {{ formatCurrency(item[header]) }}
                  </span>

                  <span v-else>
                    {{ item[header] }}
                  </span>
                </td>

                <td class="text-center">
                  <div class="d-inline-flex gap-2">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary"
                      @click="editItem(item)"
                      title="Edit Item"
                    >
                      <i class="bi bi-pencil-fill"></i>
                    </button>

                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger"
                      @click="confirmDelete(item)"
                      title="Delete Item"
                    >
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-md-none mobile-item-list">
          <div class="mobile-sort-bar d-flex align-items-center gap-2 mb-3">
            <label for="mobileSortSelect" class="small fw-semibold mb-0 text-nowrap">
              Sort by:
            </label>

            <select
              id="mobileSortSelect"
              v-model="sortKey"
              class="form-select form-select-sm"
              @change="handleMobileSortChange"
            >
              <option v-for="option in mobileSortOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>

            <button
              type="button"
              class="btn btn-sm btn-outline-secondary mobile-sort-direction-btn"
              @click="toggleMobileSortDirection"
              :aria-label="sortDirection === 'asc' ? 'Sort descending' : 'Sort ascending'"
              :title="sortDirection === 'asc' ? 'Ascending' : 'Descending'"
            >
              <i class="bi" :class="sortDirection === 'asc' ? 'bi-sort-down' : 'bi-sort-up'"></i>
            </button>
          </div>

          <div
            v-for="item in paginatedItems"
            :key="`mobile-${item.ItemNumber}`"
            class="mobile-item-card border rounded mb-3"
          >
            <div class="d-flex align-items-center justify-content-between p-3">
              <div class="d-flex align-items-center gap-2 mobile-item-summary">
                <img
                  v-if="item.ItemImage"
                  :src="getImageThumbnailUrl(item)"
                  alt="Item Image"
                  class="img-thumbnail mobile-item-thumb"
                  loading="lazy"
                  decoding="async"
                  width="48"
                  height="48"
                />

                <button
                  type="button"
                  class="btn btn-link p-0 text-decoration-underline fw-semibold mobile-item-number"
                  @click="viewItemDetail(item)"
                >
                  {{ item.ItemNumber }}
                </button>

                <span class="mobile-item-subtype text-muted small">
                  {{ item.ItemSubType || "-" }}
                </span>
                <span class="mobile-item-price fw-semibold">
                  {{ formatCurrency(item.ItemAskingPrice) }}
                </span>
              </div>

              <button
                type="button"
                class="btn btn-sm btn-outline-secondary mobile-expand-btn"
                @click="toggleExpandedItem(item.ItemNumber)"
                :aria-expanded="isExpanded(item.ItemNumber)"
                :aria-controls="`mobile-item-details-${item.ItemNumber}`"
              >
                <i class="bi" :class="isExpanded(item.ItemNumber) ? 'bi-dash-lg' : 'bi-plus-lg'"></i>
              </button>
            </div>

            <div
              v-if="isExpanded(item.ItemNumber)"
              :id="`mobile-item-details-${item.ItemNumber}`"
              class="px-3 pb-3"
            >
              <div
                v-for="header in mobileDetailHeaders"
                :key="`${item.ItemNumber}-mobile-${header}`"
                class="mobile-item-field py-2 border-top"
              >
                <div class="mobile-item-field-row">
                  <div class="mobile-item-label fw-semibold small text-muted">
                    {{ headerLabels[header] || header }}
                  </div>

                  <div class="mobile-item-value text-end">
                    <template v-if="['ItemAskingPrice', 'ItemCost'].includes(header)">
                      {{ formatCurrency(item[header]) }}
                    </template>

                    <template v-else>
                      {{ item[header] || "-" }}
                    </template>
                  </div>
                </div>
              </div>

              <div class="d-flex gap-2 pt-3 border-top mt-2">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-primary"
                  @click="editItem(item)"
                  title="Edit Item"
                >
                  <i class="bi bi-pencil-fill me-1"></i>
                  Edit
                </button>

                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  @click="confirmDelete(item)"
                  title="Delete Item"
                >
                  <i class="bi bi-trash-fill me-1"></i>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
          <nav aria-label="Items pagination">
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button
                  type="button"
                  class="page-link"
                  @click="goToPreviousPage"
                  :disabled="currentPage === 1"
                >
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>

              <li
                v-for="(page, index) in visiblePages"
                :key="`${page}-${index}`"
                class="page-item"
                :class="{ active: currentPage === page, disabled: page === '...' }"
              >
                <button
                  v-if="page !== '...'"
                  type="button"
                  class="page-link"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>

                <span v-else class="page-link">
                  ...
                </span>
              </li>

              <li class="page-item" :class="{ disabled: currentPage === totalPages || totalPages === 0 }">
                <button
                  type="button"
                  class="page-link"
                  @click="goToNextPage"
                  :disabled="currentPage === totalPages || totalPages === 0"
                >
                  <i class="bi bi-chevron-right"></i>
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
import { useItemStore } from "@/store/ItemStore";

export default {
  name: "ItemList",

  data() {
    return {
      selectedCategory: "All",
      selectedSubType: "All",
      searchField: "ItemNumber",
      searchValue: "",
      appliedSearchValue: "",
      statusOptions: [],
      subTypeOptions: [],
      loading: true,
      errorMessage: "",
      currentPage: 1,
      itemsPerPage: 15,
      minPagesForFullDisplay: 10,
      auth: null,
      itemStore: null,
      sortKey: "ItemNumber",
      sortDirection: "asc",
      generatingPdf: false,
      expandedMobileItems: [],
      isMobile: window.innerWidth < 768,

      headerLabels: {
        ItemNumber: "Item Number",
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
    sourceItems() {
      return Array.isArray(this.itemStore?.items) ? this.itemStore.items : [];
    },

    headers() {
      if (!this.sourceItems.length) return [];
      return Object.keys(this.sourceItems[0]);
    },

    mobileDetailHeaders() {
      return this.headers.filter(
        (header) => !["ItemNumber", "ItemImage"].includes(header)
      );
    },

    filteredItems() {
      const searchTerm = String(this.appliedSearchValue ?? "").trim().toLowerCase();

      return this.sourceItems.filter((item) => {
        const matchesCategory =
          this.selectedCategory === "All" || item.ItemStatus === this.selectedCategory;

        const matchesSubType =
          this.selectedSubType === "All" || item.ItemSubType === this.selectedSubType;

        const matchesSearch =
          !searchTerm ||
          String(item[this.searchField] ?? "").toLowerCase().includes(searchTerm);

        return matchesCategory && matchesSubType && matchesSearch;
      });
    },

    sortedItems() {
      if (!this.sortKey) return this.filteredItems;

      return [...this.filteredItems].sort((a, b) => {
        let valA = a[this.sortKey];
        let valB = b[this.sortKey];

        const numA = Number(valA);
        const numB = Number(valB);
        const bothNumeric = !Number.isNaN(numA) && !Number.isNaN(numB);

        if (bothNumeric) {
          valA = numA;
          valB = numB;
        } else {
          valA = String(valA ?? "").toLowerCase();
          valB = String(valB ?? "").toLowerCase();
        }

        if (valA < valB) return this.sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return this.sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    },

    totalPages() {
      return Math.ceil(this.sortedItems.length / this.itemsPerPage);
    },

    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.sortedItems.slice(start, end);
    },

    startItem() {
      if (this.filteredItems.length === 0) return 0;
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },

    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.filteredItems.length);
    },

    visiblePages() {
      if (this.totalPages <= 0) return [];

      const siblingCount = this.isMobile ? 1 : 2;
      const fullDisplayCount = this.isMobile ? 4 : this.minPagesForFullDisplay;

      if (this.totalPages <= fullDisplayCount) {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
      }

      const pages = [1];
      const start = Math.max(2, this.currentPage - siblingCount);
      const end = Math.min(this.totalPages - 1, this.currentPage + siblingCount);

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

    mobileSortOptions() {
      return this.headers
        .filter((header) => header !== "ItemImage")
        .map((header) => ({
          value: header,
          label: this.headerLabels[header] || header,
        }));
    },
  },

  methods: {
    async loadItems(forceRefresh = false) {
      this.loading = true;
      this.errorMessage = "";

      try {
        await this.itemStore.fetchItems(forceRefresh);
      } catch (error) {
        this.errorMessage = error.message || "Failed to load items.";
      } finally {
        this.loading = false;
      }
    },

    async loadSubTypes() {
      const subTypesFromApi = await this.itemStore.fetchSubTypes();
      this.subTypeOptions = [
        { value: "All", label: "All" },
        ...subTypesFromApi
          .filter((subType) => subType?.subTypeName)
          .map((subType) => ({
            value: subType.subTypeName,
            label: subType.subTypeName,
          })),
      ];
    },

    async loadStatusOptions() {
      const statusesFromApi = await this.itemStore.fetchStatuses();
      this.statusOptions = [
        { value: "All", label: "All" },
        ...statusesFromApi
          .filter((status) => status?.statusOption)
          .map((status) => ({
            value: status.statusOption,
            label: status.statusLabel,
          })),
      ];
    },

    syncStateToRoute() {
      this.$router.replace({
        query: {
          category: this.selectedCategory,
          subType: this.selectedSubType,
          sortKey: this.sortKey,
          sortDirection: this.sortDirection,
          page: String(this.currentPage),
          searchField: this.searchField,
          searchValue: this.searchValue,
          appliedSearchValue: this.appliedSearchValue,
        },
      });
    },

    restoreStateFromRoute() {
      const query = this.$route.query;

      this.selectedCategory = query.category || "All";
      this.selectedSubType = query.subType || "All";
      this.sortKey = query.sortKey || "ItemNumber";
      this.sortDirection = query.sortDirection || "asc";
      this.currentPage = query.page ? Number(query.page) : 1;
      this.searchField = query.searchField || "ItemNumber";
      this.searchValue = query.searchValue || "";
      this.appliedSearchValue = query.appliedSearchValue || "";
    },

    findItems() {
      this.appliedSearchValue = this.searchValue;
      this.currentPage = 1;
      this.expandedMobileItems = [];
      this.syncStateToRoute();
    },

    clearSearch() {
      this.searchField = "ItemNumber";
      this.searchValue = "";
      this.appliedSearchValue = "";
      this.currentPage = 1;
      this.expandedMobileItems = [];
      this.syncStateToRoute();
    },

    handleFilterChange() {
      this.currentPage = 1;
      this.expandedMobileItems = [];
      this.syncStateToRoute();
    },

    addNewItem() {
      const maxItemNumber = this.sourceItems.length
        ? Math.max(...this.sourceItems.map((item) => Number(item.ItemNumber) || 0))
        : 0;

      const nextItemNumber = maxItemNumber + 1;

      this.$router.push({
        path: "/editItem",
        query: {
          ...this.$route.query,
          itemNumber: nextItemNumber,
        },
      });
    },

    viewItemDetail(item) {
      this.$router.push({
        path: `/itemDetail/${item.ItemNumber}`,
        query: { ...this.$route.query },
      });
    },

    editItem(item) {
      this.$router.push({
        path: `/editItem/${item.ItemNumber}`,
        query: { ...this.$route.query },
      });
    },

    handleResize() {
      this.isMobile = window.innerWidth < 768;
    },

    goToCreatePdfReport() {
      this.$router.push({
        path: `/create-pdf-report`,
        query: { ...this.$route.query },
      });
    },

    getImageThumbnailUrl(item) {
      return APIService.getImageThumbnailUrl(item);
    },

    formatCurrency(value) {
      if (value == null || value === "") return "";
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
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
      this.expandedMobileItems = [];
      this.syncStateToRoute();
    },

    goToPage(page) {
      this.currentPage = page;
      this.expandedMobileItems = [];
      this.syncStateToRoute();
    },

    goToPreviousPage() {
      if (this.currentPage > 1) {
        this.currentPage -= 1;
        this.expandedMobileItems = [];
        this.syncStateToRoute();
      }
    },

    goToNextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage += 1;
        this.expandedMobileItems = [];
        this.syncStateToRoute();
      }
    },

    toggleExpandedItem(itemNumber) {
      if (this.expandedMobileItems.includes(itemNumber)) {
        this.expandedMobileItems = this.expandedMobileItems.filter(
          (number) => number !== itemNumber
        );
      } else {
        this.expandedMobileItems = [...this.expandedMobileItems, itemNumber];
      }
    },

    isExpanded(itemNumber) {
      return this.expandedMobileItems.includes(itemNumber);
    },

    async confirmDelete(item) {
      const ok = window.confirm(
        `Are you sure you want to delete item #${item.ItemNumber}?`
      );
      if (!ok) return;

      try {
        await APIService.deleteItem(item.ItemNumber);

        this.itemStore.removeItem(item.ItemNumber);

        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = this.totalPages;
        } else if (this.totalPages === 0) {
          this.currentPage = 1;
        }

        this.syncStateToRoute();
      } catch (error) {
        window.alert(error.message || "Delete failed.");
      }
    },

    handleMobileSortChange() {
      this.currentPage = 1;
      this.expandedMobileItems = [];
      this.syncStateToRoute();
    },

    toggleMobileSortDirection() {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
      this.currentPage = 1;
      this.expandedMobileItems = [];
      this.syncStateToRoute();
    },
  },

  created() {
    this.itemStore = useItemStore();
  },

  async mounted() {
    this.auth = useAuthStore();
    this.itemStore = useItemStore();

    if (!this.auth.isAuthenticated) {
      window.alert("You must be logged in to view items.");
      this.$router.push("/");
      return;
    }

    window.addEventListener("resize", this.handleResize);

    this.restoreStateFromRoute();
    await this.loadItems();
    await this.loadSubTypes();
    await this.loadStatusOptions();

    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
      this.syncStateToRoute();
    }
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
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

.search-field-select {
  max-width: 180px;
}

.item-search-input {
  min-width: 180px;
  max-width: 220px;
}

.mobile-item-card {
  background: #fff;
}

.mobile-item-summary {
  min-width: 0;
}

.mobile-item-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  flex-shrink: 0;
}

.mobile-item-number {
  font-size: 1rem;
  min-width: 0;
}

.mobile-expand-btn {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.mobile-item-field:first-child {
  border-top: none !important;
}

.mobile-item-field-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.mobile-item-label {
  flex: 0 0 40%;
}

.mobile-item-subtype {
  min-width: 0;
  word-break: break-word;
}

.mobile-item-value {
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.mobile-sort-bar {
  background: #fff;
}

.mobile-sort-direction-btn {
  min-width: 2.5rem;
}

.pagination {
  flex-wrap: wrap;
}

.page-link {
  padding: 0.375rem 0.65rem;
}

@media (max-width: 767.98px) {
  .pagination {
    gap: 0.15rem;
  }

  .page-link {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }
}
</style>