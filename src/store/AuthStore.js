import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: false,
    user: null,
  }),

  actions: {
    setAuth({ user, access, refresh }) {
      this.isAuthenticated = true;
    },
 
    clearAuth() {
      this.isAuthenticated = false;
      this.user = null;  
    },
  },
   // ensure the local storage is persistent during the session
  persist: {
    storage: localStorage,
    pick: ["isAuthenticated", "user"],
  },
});
