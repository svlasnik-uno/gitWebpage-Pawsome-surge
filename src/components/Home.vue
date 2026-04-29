<template>
  <div class="site">
    <main class="container-fluid py-4 home-main">
      <div
        class="slideshow-container"
        @touchstart.stop="handleTouchStart"
        @touchmove.stop="handleTouchMove"
        @touchend.stop="handleTouchEnd"
        @click.stop
      >
        <div
          v-for="(image, index) in images"
          :key="index"
          class="slide slide-clickable"
          v-show="currentSlide === index"
          @click.stop="viewItem(image)"
          role="button"
          tabindex="0"
          :aria-label="`View details for ${image.alt}`"
          @keyup.enter="viewItem(image)"
          @keyup.space.prevent="viewItem(image)"
        >
          <img class="show-img" :src="image.src" :alt="image.alt" />

          <div class="bottom-overlay">
            <div class="overlay-text">Click to view details</div>

            <div v-if="images.length > 1" class="dots overlay-dots">
              <span
                v-for="(dotImage, dotIndex) in images"
                :key="'dot-' + dotIndex"
                class="dot"
                :class="{ activeDot: currentSlide === dotIndex }"
                @click.stop.prevent="goToSlide(dotIndex)"
                @touchstart.stop.prevent
                @touchend.stop.prevent="goToSlide(dotIndex)"
              ></span>
            </div>
          </div>
        </div>

        <button
          v-if="images.length > 1"
          type="button"
          class="nav-btn prev"
          @click.stop.prevent="prevSlide"
          @touchstart.stop.prevent
          @touchend.stop.prevent="prevSlide"
        >
          &#10094;
        </button>

        <button
          v-if="images.length > 1"
          type="button"
          class="nav-btn next"
          @click.stop.prevent="nextSlide"
          @touchstart.stop.prevent
          @touchend.stop.prevent="nextSlide"
        >
          &#10095;
        </button>
      </div>
    </main>
  </div>
</template>

<script>
import APIService from "@/api/APIService";
import { useItemStore } from "@/store/ItemStore";

export default {
  name: "Home",
  data() {
    return {
      currentSlide: 0,
      slideInterval: null,
      touchStartX: 0,
      touchEndX: 0,
      images: [],
      itemStore: null,
    };
  },
  async mounted() {
    this.itemStore = useItemStore();
    await this.loadSlideshowImages();
    this.startSlideshow();
    window.addEventListener("keydown", this.handleKeydown);
  },
  beforeUnmount() {
    clearInterval(this.slideInterval);
    window.removeEventListener("keydown", this.handleKeydown);
  },
  methods: {
    async loadSlideshowImages() {
      try {
        const items = await this.itemStore.fetchItemsByImageType("H");

        this.images = items
          .slice(0, 8)
          .map((item) => ({
            src: APIService.getImageUrl(item),
            alt: item.ItemName || "Gallery image",
            itemNumber: item.ItemNumber,
          }))
          .filter((image) => image.src);
      } catch (error) {
        console.error("Error loading slideshow images:", error);
      }
    },

    viewItem(image) {
      if (!image?.itemNumber) return;

      this.$router.push({
        path: `/itemDetail/${image.itemNumber}`,
      });
    },

    startSlideshow() {
      clearInterval(this.slideInterval);

      if (this.images.length <= 1) return;

      this.slideInterval = setInterval(() => {
        this.currentSlide = (this.currentSlide + 1) % this.images.length;
      }, 3000);
    },

    resetInterval() {
      this.startSlideshow();
    },

    nextSlide() {
      if (!this.images.length) return;
      this.currentSlide = (this.currentSlide + 1) % this.images.length;
      this.resetInterval();
    },

    prevSlide() {
      if (!this.images.length) return;
      this.currentSlide =
        (this.currentSlide - 1 + this.images.length) % this.images.length;
      this.resetInterval();
    },

    goToSlide(index) {
      this.currentSlide = index;
      this.resetInterval();
    },

    handleKeydown(e) {
      if (e.key === "ArrowLeft") {
        this.prevSlide();
      } else if (e.key === "ArrowRight") {
        this.nextSlide();
      }
    },

    handleTouchStart(event) {
      this.touchStartX = event.touches[0].clientX;
      this.touchEndX = event.touches[0].clientX;
    },

    handleTouchMove(event) {
      this.touchEndX = event.touches[0].clientX;
    },

    handleTouchEnd() {
      if (this.images.length <= 1) return;

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
.site {
  min-height: auto;
}

.home-main {
  flex: 0 0 auto;
}

.slideshow-container {
  position: relative;
  max-width: 650px;
  margin: 0 auto;
  overflow: hidden;
  touch-action: pan-y;
}

.slide {
  display: block;
  position: relative;
  z-index: 1;
}

.slide-clickable {
  cursor: pointer;
}

.show-img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
  border-radius: 12px;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.slide-clickable:hover .show-img {
  opacity: 0.96;
}

.bottom-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 30px 16px 14px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.72), transparent);
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.slide-clickable:hover .bottom-overlay {
  opacity: 1;
}

.overlay-text {
  color: white;
  text-align: center;
  font-size: 0.95rem;
  margin-bottom: 8px;
  pointer-events: none;
}

.overlay-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  pointer-events: auto;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
}

.activeDot {
  background: black;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
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

.prev {
  left: 12px;
}

.next {
  right: 12px;
}

@media (hover: none) {
  .bottom-overlay {
    opacity: 1;
  }
}
</style>