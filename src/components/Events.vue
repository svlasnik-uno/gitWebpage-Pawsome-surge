<template>
  <main class="site-content py-2 events-page">
    <div class="container-fluid px-2">
      <div v-if="loading" class="text-center py-4">
        Loading events...
      </div>

      <div v-else-if="errorMessage" class="alert alert-danger" role="alert">
        {{ errorMessage }}
      </div>

      <div v-else-if="events.length === 0" class="alert alert-info">
        No events to display.
      </div>

      <div v-else class="row">
        <div
          v-for="event in events"
          :key="event.id"
          class="col-md-4 col-sm-6 col-12 mb-3"
        >
          <div class="card gallery-card h-100">
            <div class="event-image-wrapper">
              <img
                :src="event.src"
                :alt="event.alt"
                class="event-img"
              />
            </div>

            <div v-if="event.text" class="image-text">
              {{ event.text }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import APIService from "@/api/APIService";

const events = ref([]);
const loading = ref(true);
const errorMessage = ref("");

const formatEventText = (event) => {
  const parts = [];

  if (event.eventName) {
    parts.push(event.eventName);
  }

  if (event.eventDate) {
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(event.eventDate));

    parts.push(formattedDate);
  }

  if (event.eventLocation) {
    parts.push(event.eventLocation);
  }

  return parts.join(" - ");
};

const loadEvents = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const data = await APIService.getEventsByDisplay("Y");

    events.value = (Array.isArray(data) ? data : [])
      .filter((event) => event.eventImage)
      .map((event) => ({
        id: event.id,
        src: APIService.getEventImageUrl(event),
        alt: event.eventName || "Event image",
        text: formatEventText(event),
      }))
      .filter((event) => event.src);
  } catch (error) {
    errorMessage.value = error.message || "Failed to load events.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadEvents();
});
</script>

<style scoped>
.gallery-card {
  position: relative;
  overflow: hidden;
  border: none;
}

.image-text {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 0.75rem;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  text-align: center;
}

.event-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.event-image-wrapper {
  height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}
</style>