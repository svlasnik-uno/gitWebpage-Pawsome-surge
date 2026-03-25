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
const images = [
  { src: "/img/gallery/1.jpg", alt: "Arrangement 1" },
  { src: "/img/gallery/2.jpg", alt: "Arrangement 2" },
  { src: "/img/gallery/3.jpg", alt: "Arrangement 3" },
  { src: "/img/gallery/4.jpg", alt: "Arrangement 4" },
  { src: "/img/gallery/5.jpg", alt: "Arrangement 5" },
  { src: "/img/gallery/6.jpg", alt: "Arrangement 6" },
  { src: "/img/gallery/7.jpg", alt: "Arrangement 7" },
  { src: "/img/gallery/8.jpg", alt: "Arrangement 8" },
  { src: "/img/gallery/9.jpg", alt: "Arrangement 9" },
  { src: "/img/gallery/10.png", alt: "Arrangement 10" },
  { src: "/img/gallery/11.png", alt: "Arrangement 11" },
  { src: "/img/gallery/12.png", alt: "Arrangement 12" },
  { src: "/img/gallery/13.jpg", alt: "Arrangement 13" },
  { src: "/img/gallery/14.jpg", alt: "Arrangement 14" },
  { src: "/img/gallery/15.jpg", alt: "Arrangement 15" },
  { src: "/img/gallery/16.jpg", alt: "Arrangement 16" },
  { src: "/img/gallery/17.jpg", alt: "Arrangement 17" },
  { src: "/img/gallery/18.jpg", alt: "Arrangement 18" },
];
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
