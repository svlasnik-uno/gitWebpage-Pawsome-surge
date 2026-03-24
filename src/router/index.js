import { createRouter, createWebHistory } from "vue-router";

import Home from "@/components/Home.vue";
import Gallery from "@/components/Gallery.vue";
import Events from "@/components/Events.vue";
import About from "@/components/AboutUs.vue";


const routes = [
  { path: "/", component: Home },
  { path: "/events", component: Events },
  { path: "/gallery", component: Gallery },
  { path: "/about", component: About },
];

const router = createRouter({
   history: createWebHistory(import.meta.env.BASE_URL),
   routes
 })
export default router