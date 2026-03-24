<template>
  <main class="site-content py-2 events-page">
<div class="container-fluid px-2">
      <div class="row">
        <div
          v-for="(event, index) in events"
          :key="index"
          class="col-md-4 col-sm-6 col-12 mb-0"
        >
          <div class="card gallery-card">
            <div class="event-image-wrapper">
              <img :src="event.src" :alt="event.alt" class="event-img" />
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
const events = [
  {
    src: "/img/events/MW Image.jpg",
    alt: "Millard West Baseball Craft Fair",
    text: "MWHS Spring Craft Fair - March 14, 2026",
  },
  {
    src: "/img/events/HillcrestHighlands.jpg",
    alt: "Look for our booth!",
    text: "",
  },
  {
    src: "/img/events/booth.jpg",
    alt: "Look for our booth!",
    text: "Look for our booth!",
  },
];
</script>

<style scoped>
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
</style>
