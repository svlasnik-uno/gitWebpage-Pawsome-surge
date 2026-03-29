import { createRouter, createWebHistory } from "vue-router";

import Home from "@/components/Home.vue";
import Gallery from "@/components/Gallery.vue";
import Events from "@/components/Events.vue";
import About from "@/components/AboutUs.vue";
import Auth from "@/components/Auth.vue";
import Register from "@/components/Register.vue";
import ItemList from "@/components/ItemList.vue";
import ItemForm from "@/components/ItemForm.vue";
import ItemDetail from "@/components/ItemDetail.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/events", component: Events },
  { path: "/gallery", component: Gallery },
  { path: "/about", component: About },
  { path: "/auth", component: Auth },
  { path: "/itemList", component: ItemList },
  { path: "/itemDetail/:itemNumber", component: ItemDetail },
  { path: "/register", component: Register },
  { path: "/editItem/:itemNumber?", component: ItemForm },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
export default router;
