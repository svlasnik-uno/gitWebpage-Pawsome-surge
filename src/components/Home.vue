<template>
  <div class="site">
    <main class="content container-fluid py-4">
      <div
        class="slideshow-container"
        @touchstart.stop.prevent="handleTouchStart"
        @touchmove.stop.prevent
        @touchend.stop.prevent="handleTouchEnd"
        @click.stop
      >
        <div
          v-for="(image, index) in images"
          :key="index"
          class="slide"
          v-show="currentSlide === index"
        >
          <img class="show-img" :src="image.src" :alt="image.alt" />
        </div>

        <button
          type="button"
          class="nav-btn prev"
          @click.stop.prevent="prevSlide"
          @touchstart.stop.prevent
          @touchend.stop.prevent="prevSlide"
        >
          &#10094;
        </button>

        <button
          type="button"
          class="nav-btn next"
          @click.stop.prevent="nextSlide"
          @touchstart.stop.prevent
          @touchend.stop.prevent="nextSlide"
        >
          &#10095;
        </button>

        <div class="dots">
          <span
            v-for="(image, index) in images"
            :key="'dot-' + index"
            class="dot"
            :class="{ activeDot: currentSlide === index }"
            @click.stop.prevent="goToSlide(index)"
            @touchstart.stop.prevent
            @touchend.stop.prevent="goToSlide(index)"
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
      touchStartX: 0,
      touchEndX: 0,
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
    window.addEventListener("keydown", this.handleKeydown);
  },
  beforeDestroy() {
    clearInterval(this.slideInterval);
    window.removeEventListener("keydown", this.handleKeydown);
  },
  methods: {
    startSlideshow() {
      this.slideInterval = setInterval(() => {
        this.currentSlide = (this.currentSlide + 1) % this.images.length;
      }, 3000);
    },

    resetInterval() {
      clearInterval(this.slideInterval);
      this.startSlideshow();
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

    goToSlide(index) {
      this.currentSlide = index;
      this.resetInterval();
    },

    handleTouchStart(event) {
      this.touchStartX = event.changedTouches[0].screenX;
    },

    handleTouchEnd(event) {
      this.touchEndX = event.changedTouches[0].screenX;
      const diff = this.touchEndX - this.touchStartX;

      if (Math.abs(diff) < 50) return;

      if (diff > 0) {
        this.prevSlide();
      } else {
        this.nextSlide();
      }
    },
  },
};
</script>

<style scoped>
.slideshow-container {
  position: relative;
  max-width: 700px;
  margin: 0 auto;
  overflow: visible;
}

.slide {
  display: block;
  position: relative;
  z-index: 1;
}

.show-img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
  border-radius: 12px;
  pointer-events: none;
}

/* arrows */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 999;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.75);
}

.prev {
  left: 12px;
}

.next {
  right: 12px;
}

.dots {
  position: absolute;
  bottom: 14px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 999;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
}

.activeDot {
  background: black;
}
</style>
