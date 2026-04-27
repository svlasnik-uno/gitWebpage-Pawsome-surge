import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: false,
    user: null,
    userId: "",
    usertype: null,
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  }),

  actions: {
    setAuth({
      user,
      userId = "",
      usertype = null,
      firstName = "",
      lastName = "",
      phone = "",
      email = "",
    }) {
      this.isAuthenticated = true;
      this.user = user;
      this.userId = userId;
      this.usertype = usertype;
      this.firstName = firstName;
      this.lastName = lastName;
      this.phone = phone;
      this.email = email;
    },

    clearAuth() {
      this.isAuthenticated = false;
      this.user = null;
      this.userId = "";
      this.usertype = null;
      this.firstName = "";
      this.lastName = "";
      this.phone = "";
      this.email = "";
    },
  },

  persist: {
    storage: localStorage,
    pick: [
      "isAuthenticated",
      "user",
      "userId",
      "usertype",
      "firstName",
      "lastName",
      "phone",
      "email",
    ],
  },
});