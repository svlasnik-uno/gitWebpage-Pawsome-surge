<template>
  <main class="site-content py-2 gallery-page">
    <h4 class="gallery-title">A few of our arrangements</h4>

    <div class="container mt-3">
      <div class="row">
        <div
          v-for="(image, index) in images"
          :key="index"
          class="col-md-4 col-sm-6 col-12 mb-3"
        >
          <div class="card gallery-card">
            <img
              class="gallery-img img-fluid"
              :src="image.src"
              :alt="image.alt"
            />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import APIService from "@/api/APIService";

const images = ref([]);

const loadGalleryImages = async () => {
  try {
    const items = await APIService.getItemsByImageType("G");

    images.value = items
      .map((item) => ({
        src: APIService.getGalleryImageUrl(item),
        alt: item.ItemName || "Gallery image",
      }))
      .filter((image) => image.src);
  } catch (error) {
    console.error("Error loading gallery images:", error);
  }
};

onMounted(() => {
  loadGalleryImages();
});
</script>

<style scoped>
.gallery-card {
  height: 400px;
  overflow: hidden;
  border: none;
}

.gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gallery-title {
  display: block;
  text-align: center;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  line-height: 1.3;
  margin: 0 0 1rem 0;
  padding: 0 12px;
  white-space: normal;
  position: static;
}

@media (max-width: 576px) {
  .gallery-title {
    font-size: 1.5rem;
    line-height: 1.4;
    padding: 0 16px;
  }
}

.gallery-title mark {
  line-height: inherit;
}
</style>