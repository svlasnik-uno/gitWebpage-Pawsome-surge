<template>
  <div class="site">
<main class="content container-fluid py-4">
      <div class="slideshow-container">
        <div
          v-for="(image, index) in images"
          :key="index"
          class="Containers"
          v-show="currentSlide === index"
        >
          <div class="card gallery-card">
            <div class="gallery-wrapper">
              <img class="gallery-img" :src="image.src" :alt="image.alt" />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      currentSlide: 0,
      slideInterval: null,
      images: [
        { src: "/img/flowers_1.jpg", alt: "Wood flower arrangement" },
        { src: "/img/flowers_2.jpg", alt: "Wood flower arrangement" },
        { src: "/img/flowers_3.jpg", alt: "Wood flower arrangement" },
        { src: "/img/flowers_4.jpg", alt: "Wood flower arrangement" },
        { src: "/img/flowers_5.jpg", alt: "Wood flower arrangement" },
        { src: "/img/flowers_6.jpg", alt: "Wood flower arrangement" },
        { src: "/img/flowers_7.jpg", alt: "Wood flower arrangement" },
        { src: "/img/flowers_8.jpg", alt: "Wood flower arrangement" },
      ],
    };
  },
  mounted() {
    this.startSlideshow();
  },
  beforeUnmount() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  },
  methods: {
    startSlideshow() {
      this.slideInterval = setInterval(() => {
        this.currentSlide = (this.currentSlide + 1) % this.images.length;
      }, 3000);
    },
  },
};
</script>

<style scoped>
/* Keep only one slide visible */
.Containers {
  display: block;
}
</style>
