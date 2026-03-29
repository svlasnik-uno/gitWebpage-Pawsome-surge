import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"
import { createPinia, getActivePinia } from 'pinia'
import "./assets/css/main.css"; 
import "bootstrap-icons/font/bootstrap-icons.css";

const pinia = createPinia();

createApp(App).use(pinia).use(router).mount('#app')