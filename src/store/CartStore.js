// CartStore.js
import { defineStore } from "pinia";

const PENDING_CART_KEY = "pending_cart_items";

export const useCartStore = defineStore("cartStore", {
  state: () => ({
    cartItems: [],
    userEmail: null,
  }),

  getters: {
    cartCount: (state) => state.cartItems.length,

    cartTotal: (state) =>
      state.cartItems.reduce((total, item) => {
        const price = Number(item.ItemAskingPrice || 0);
        return total + price;
      }, 0),
  },

  actions: {
    // 🔑 Generate storage key per user
    getStorageKey(email = this.userEmail) {
      if (!email) return null;
      return `cart_${encodeURIComponent(email.toLowerCase())}`;
    },

    // 🔄 Call this on login
    setUser(email) {
      this.userEmail = email?.toLowerCase() || null;
      this.loadCart();
    },

    // 📥 Load cart from localStorage
    loadCart() {
      const key = this.getStorageKey();

      if (!key) {
        this.cartItems = [];
        return;
      }

      const saved = localStorage.getItem(key);
      this.cartItems = saved ? JSON.parse(saved) : [];
    },

    // 💾 Save cart to localStorage
    persistCart() {
      const key = this.getStorageKey();
      if (!key) return;

      localStorage.setItem(key, JSON.stringify(this.cartItems));
    },

    getPendingCartItems() {
      try {
        const raw = sessionStorage.getItem(PENDING_CART_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error("Failed to read pending cart items:", error);
        return [];
      }
    },

    savePendingCartItem(item) {
      if (!item || item.ItemNumber == null) return;

      const pending = this.getPendingCartItems();
      const exists = pending.some(
        (pendingItem) =>
          String(pendingItem.ItemNumber) === String(item.ItemNumber)
      );

      if (!exists) {
        pending.push(item);
        sessionStorage.setItem(PENDING_CART_KEY, JSON.stringify(pending));
      }
    },

    clearPendingCartItems() {
      sessionStorage.removeItem(PENDING_CART_KEY);
    },

    async flushPendingCartItems() {
      const items = this.getPendingCartItems();
      if (!items.length) return [];

      items.forEach((item) => this.addToCart(item));
      this.clearPendingCartItems();
      return this.cartItems;
    },

    addToCart(item) {
      const exists = this.cartItems.some(
        (cartItem) =>
          String(cartItem.ItemNumber) === String(item.ItemNumber)
      );

      if (!exists) {
        this.cartItems.push(item);
        this.persistCart(); // ✅ save after change
      }
    },

    removeFromCart(itemNumber) {
      this.cartItems = this.cartItems.filter(
        (item) => String(item.ItemNumber) !== String(itemNumber)
      );

      this.persistCart(); // ✅ save after change
    },

    clearCart() {
      this.cartItems = [];
      this.persistCart(); // ✅ clear stored cart too
    },

    // 🚪 Call this on logout (does NOT delete saved cart)
    clearLocalState() {
      this.cartItems = [];
      this.userEmail = null;
    },
  },
});