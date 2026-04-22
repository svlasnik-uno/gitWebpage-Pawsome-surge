// CartStore.js
import { defineStore } from "pinia";

export const useCartStore = defineStore("cartStore", {
  state: () => ({
    cartItems: [],
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
    addToCart(item) {
      const exists = this.cartItems.some(
        (cartItem) => String(cartItem.ItemNumber) === String(item.ItemNumber)
      );

      if (!exists) {
        this.cartItems.push(item);
      }
    },

    removeFromCart(itemNumber) {
      this.cartItems = this.cartItems.filter(
        (item) => String(item.ItemNumber) !== String(itemNumber)
      );
    },

    clearCart() {
      this.cartItems = [];
    },
  },
});
