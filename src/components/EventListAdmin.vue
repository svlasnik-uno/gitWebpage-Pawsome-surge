<template>
  <div class="container py-4 list-events-page">
    <div class="d-flex align-items-center justify-content-between gap-3 mb-4 flex-wrap">
      <div class="d-flex align-items-center gap-3 flex-wrap">
        <label for="seasonSelect" class="fw-semibold mb-0">View Events by Season:</label>
        <select id="seasonSelect" v-model="selectedSeason" class="form-select w-auto" @change="handleSeasonChange">
          <option v-for="option in seasonOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <span>
          Showing {{ startItem }} - {{ endItem }} of {{ events.length }} events
        </span>
      </div>

      <div class="d-flex align-items-center gap-2 flex-wrap">
        <input
          v-model="searchEventId"
          type="number"
          class="form-control event-id-search"
          placeholder="Enter Event ID"
          @keyup.enter="findByEventId"
        />

        <button type="button" class="btn btn-secondary" @click="findByEventId">
          Find
        </button>

        <button type="button" class="btn btn-secondary" @click="clearSearch">
          Clear Search
        </button>

        <button type="button" class="btn btn-secondary" @click="addNewEvent">
          Add New Event
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-4">
      Loading events...
    </div>

    <div v-else-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </div>

    <div v-else>
      <div v-if="events.length === 0" class="alert alert-info">
        No events found.
      </div>

      <div v-else>
        <!-- Desktop / tablet table -->
        <div class="table-responsive d-none d-md-block">
          <table class="table table-striped table-hover align-middle sortable-table">
            <thead>
              <tr>
                <th
                  v-for="header in headers"
                  :key="header"
                  @click="sortBy(header)"
                  :class="[
                    'sortable-header',
                    ['id', 'eventDate', 'eventImage', 'eventSeason', 'eventYear', 'eventDisplay'].includes(header)
                      ? 'text-center'
                      : 'text-start'
                  ]"
                >
                  <div
                    class="th-content"
                    :class="[
                      ['id', 'eventImage', 'eventDisplay'].includes(header)
                        ? 'justify-content-center'
                        : 'justify-content-start'
                    ]"
                  >
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
              <tr v-for="event in paginatedEvents" :key="event.id">
                <td
                  v-for="header in headers"
                  :key="`${event.id}-${header}`"
                  :class="[
                    ['id', 'eventImage', 'eventDisplay'].includes(header)
                      ? 'text-center'
                      : 'text-start'
                  ]"
                >
                  <button
                    v-if="header === 'id'"
                    type="button"
                    class="btn btn-link p-0 text-decoration-underline"
                    @click="viewEventDetail(event)"
                  >
                    {{ event[header] }}
                  </button>

                  <img
                    v-else-if="header === 'eventImage' && event[header]"
                    :src="getEventImageUrl(event)"
                    alt="Event Image"
                    class="img-thumbnail"
                    style="width: 75px; height: 75px; object-fit: cover;"
                  />

                  <span v-else-if="header === 'eventDate'">
                    {{ formatDate(event[header]) }}
                  </span>

                  <span v-else>
                    {{ event[header] }}
                  </span>
                </td>

                <td class="text-center">
                  <div class="d-inline-flex gap-2">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary"
                      @click="editEvent(event)"
                      title="Edit Event"
                    >
                      <i class="bi bi-pencil-fill"></i>
                    </button>

                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger"
                      @click="confirmDelete(event)"
                      title="Delete Event"
                    >
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile accordion view -->
        <div class="d-md-none mobile-event-list">
          <div
            v-for="event in paginatedEvents"
            :key="`mobile-${event.id}`"
            class="mobile-event-card border rounded mb-3"
          >
            <div class="d-flex align-items-center justify-content-between p-3">
              <button
                type="button"
                class="btn btn-link p-0 text-decoration-underline fw-semibold mobile-event-id"
                @click="viewEventDetail(event)"
              >
                {{ event.id }}
              </button>

              <button
                type="button"
                class="btn btn-sm btn-outline-secondary mobile-expand-btn"
                @click="toggleExpandedEvent(event.id)"
                :aria-expanded="isExpanded(event.id)"
                :aria-controls="`mobile-event-details-${event.id}`"
              >
                <i
                  class="bi"
                  :class="isExpanded(event.id) ? 'bi-dash-lg' : 'bi-plus-lg'"
                ></i>
              </button>
            </div>

            <div
              v-if="isExpanded(event.id)"
              :id="`mobile-event-details-${event.id}`"
              class="px-3 pb-3"
            >
              <div
                v-for="header in mobileDetailHeaders"
                :key="`${event.id}-mobile-${header}`"
                class="mobile-event-field py-2 border-top"
              >
                <div class="mobile-event-field-row">
                  <div class="mobile-event-label fw-semibold small text-muted">
                    {{ headerLabels[header] || header }}
                  </div>

                  <div class="mobile-event-value text-end">
                    <template v-if="header === 'eventImage' && event[header]">
                      <img
                        :src="getEventImageUrl(event)"
                        alt="Event Image"
                        class="img-thumbnail"
                        style="width: 75px; height: 75px; object-fit: cover;"
                      />
                    </template>

                    <template v-else-if="header === 'eventDate'">
                      {{ formatDate(event[header]) }}
                    </template>

                    <template v-else>
                      {{ event[header] || "-" }}
                    </template>
                  </div>
                </div>
              </div>

              <div class="d-flex gap-2 pt-3 border-top mt-2">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-primary"
                  @click="editEvent(event)"
                  title="Edit Event"
                >
                  <i class="bi bi-pencil-fill me-1"></i>
                  Edit
                </button>

                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  @click="confirmDelete(event)"
                  title="Delete Event"
                >
                  <i class="bi bi-trash-fill me-1"></i>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
          <nav aria-label="Events pagination">
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button type="button" class="page-link" @click="goToPreviousPage" :disabled="currentPage === 1">
                  Previous
                </button>
              </li>

              <li
                v-for="(page, index) in visiblePages"
                :key="`${page}-${index}`"
                class="page-item"
                :class="{ active: currentPage === page, disabled: page === '...' }"
              >
                <button v-if="page !== '...'" type="button" class="page-link" @click="goToPage(page)">
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
  name: "EventList",

  data() {
    return {
      allEvents: [],
      events: [],
      selectedSeason: "All",
      searchEventId: "",
      seasonOptions: [
        { value: "Spring", label: "Spring" },
        { value: "Summer", label: "Summer" },
        { value: "Fall", label: "Fall" },
        { value: "Winter", label: "Winter" },
        { value: "All", label: "All" },
      ],
      loading: true,
      errorMessage: "",
      currentPage: 1,
      itemsPerPage: 15,
      auth: null,
      sortKey: "",
      sortDirection: "asc",
      expandedMobileEvents: [],

      headerLabels: {
        id: "ID",
        eventName: "Event Name",
        eventDate: "Date",
        eventLocation: "Location",
        eventImage: "Image",
        eventSeason: "Season",
        eventYear: "Year",
        eventDisplay: "Display on Site",
      },
    };
  },

  computed: {
    headers() {
      if (!this.events.length) return [];
      return ["id", "eventName", "eventDate", "eventLocation", "eventImage", "eventSeason", "eventYear", "eventDisplay"];
    },

    mobileDetailHeaders() {
      return this.headers.filter((header) => header !== "id");
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
      return Math.ceil(this.events.length / this.itemsPerPage);
    },

    paginatedEvents() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.sortedEvents.slice(start, end);
    },

    startItem() {
      if (this.events.length === 0) return 0;
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },

    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.events.length);
    },

    sortedEvents() {
      if (!this.sortKey) return this.events;

      return [...this.events].sort((a, b) => {
        let valA = a[this.sortKey];
        let valB = b[this.sortKey];

        if (this.sortKey === "eventDate") {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        } else if (!isNaN(valA) && !isNaN(valB)) {
          valA = Number(valA);
          valB = Number(valB);
        } else {
          valA = String(valA ?? "").toLowerCase();
          valB = String(valB ?? "").toLowerCase();
        }

        if (valA < valB) return this.sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return this.sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    },
  },

  methods: {
    async loadEvents() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const data = await APIService.getEvents();
        this.allEvents = Array.isArray(data) ? data : [];
        this.currentPage = 1;
        this.selectedSeason = "All";
        this.searchEventId = "";
        this.expandedMobileEvents = [];
        this.handleSeasonChange();
      } catch (error) {
        this.errorMessage = error.message || "Failed to load events.";
      } finally {
        this.loading = false;
      }
    },

    findByEventId() {
      const eventId = Number(this.searchEventId);

      if (!this.searchEventId || Number.isNaN(eventId)) {
        this.handleSeasonChange();
        return;
      }

      this.events = this.allEvents.filter(
        (event) => Number(event.id) === eventId
      );

      this.currentPage = 1;
      this.expandedMobileEvents = [];
    },

    clearSearch() {
      this.searchEventId = "";
      this.handleSeasonChange();
    },

    addNewEvent() {
      const maxEventId = this.allEvents.length
        ? Math.max(...this.allEvents.map((event) => Number(event.id) || 0))
        : 0;

      const nextEventId = maxEventId + 1;

      this.$router.push(`/editEvent?id=${nextEventId}`);
    },

    viewEventDetail(event) {
      this.$router.push(`/eventDetail/${event.id}`);
    },

    editEvent(event) {
      this.$router.push(`/editEvent/${event.id}`);
    },

    handleSeasonChange() {
      this.searchEventId = "";

      if (this.selectedSeason === "All") {
        this.events = this.allEvents;
      } else {
        this.events = this.allEvents.filter(
          (event) => event.eventSeason === this.selectedSeason
        );
      }

      this.currentPage = 1;
      this.expandedMobileEvents = [];
    },

    getEventImageUrl(event) {
      return APIService.getEventImageUrl
        ? APIService.getEventImageUrl(event)
        : event.eventImage || "";
    },

    sortBy(key) {
      if (key === "eventImage") return;

      if (this.sortKey === key) {
        this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
      } else {
        this.sortKey = key;
        this.sortDirection = "asc";
      }

      this.currentPage = 1;
      this.expandedMobileEvents = [];
    },

    formatDate(value) {
      if (!value) return "";

      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(value));
    },

    goToPage(page) {
      this.currentPage = page;
      this.expandedMobileEvents = [];
    },

    goToPreviousPage() {
      if (this.currentPage > 1) {
        this.currentPage -= 1;
        this.expandedMobileEvents = [];
      }
    },

    goToNextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage += 1;
        this.expandedMobileEvents = [];
      }
    },

    toggleExpandedEvent(eventId) {
      if (this.expandedMobileEvents.includes(eventId)) {
        this.expandedMobileEvents = this.expandedMobileEvents.filter(
          (id) => id !== eventId
        );
      } else {
        this.expandedMobileEvents = [...this.expandedMobileEvents, eventId];
      }
    },

    isExpanded(eventId) {
      return this.expandedMobileEvents.includes(eventId);
    },

    async confirmDelete(event) {
      const ok = window.confirm(
        `Are you sure you want to delete event #${event.id}?`
      );

      if (!ok) return;

      try {
        await APIService.deleteEvent(event.id);
        await this.loadEvents();

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
      window.alert("You must be logged in to view events.");
      this.$router.push("/");
      return;
    }

    await this.loadEvents();
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

.header-label {
  display: inline-block;
  white-space: nowrap;
}

.list-events-page {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.event-id-search {
  max-width: 140px;
}

.mobile-event-card {
  background: #fff;
}

.mobile-event-id {
  font-size: 1rem;
}

.mobile-expand-btn {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.mobile-event-field:first-child {
  border-top: none !important;
}

.mobile-event-field-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.mobile-event-label {
  flex: 0 0 40%;
}

.mobile-event-value {
  flex: 1;
  min-width: 0;
  word-break: break-word;
}
</style>