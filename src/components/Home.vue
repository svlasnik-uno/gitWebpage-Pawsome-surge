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

        <button class="nav-btn prev" @click="prevSlide">&#10094;</button
        ><!--left-->
        <button class="nav-btn next" @click="nextSlide">&#10095;</button
        ><!--right-->

        <div class="dots">
          <span
            v-for="(image, index) in images"
            :key="index"
            class="dot"
            :class="{ activeDot: currentSlide === index }"
            @click="goToSlide(index)"
          ></span>
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
        this.nextSlide();
      }, 3000);
    },

    nextSlide() {
      this.currentSlide = (this.currentSlide + 1) % this.images.length;
      this.resetInterval();
    },

    prevSlide() {
      this.currentSlide =
        (this.currentSlide - 1 + this.images.length) % this.images.length;
      this.resetInterval();
    },

    resetInterval() {
      clearInterval(this.slideInterval);
      this.startSlideshow();
    },

    goToSlide(index) {
      this.currentSlide = index;
      this.resetInterval();
    },
  },
};
</script>

<style scoped>
.Containers {
  display: block;
}

.slideshow-container {
  position: relative;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.4);
  color: white;
  border: none;
  padding: 10px 15px;
  font-size: 24px;
  cursor: pointer;
  border-radius: 50%;
}

.prev {
  left: 10px;
}

.next {
  right: 10px;
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}
.dots {
  position: absolute;
  bottom: 10px;
  width: 100%;
  display: flex;
  justify-content: center; /* centers horizontally */
  align-items: center;
  z-index: 2;
}
.dot {
  height: 12px;
  width: 12px;
  margin: 0 5px;
  background-color: white; /* soft white */
  border-radius: 50%;
  cursor: pointer;
}

/* Active dot = solid white */
.activeDot {
  background-color: black;
}

/* Hover effect */
.dot:hover {
  background-color: grey;
}


</style>
