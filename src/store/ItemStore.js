import { defineStore } from "pinia";

export const useItemStore = defineStore("itemStore", {
  state: () => ({
    items: [],
    subTypes: [],
    statuses: [],
  }),

  actions: {
    setItems(items) {
      this.items = Array.isArray(items) ? items : [];
    },

    setSubTypes(subTypes) {
      this.subTypes = Array.isArray(subTypes) ? subTypes : [];
    },

    setStatuses(statuses) {
      this.statuses = Array.isArray(statuses) ? statuses : [];
    },

    addItem(item) {
      this.items.unshift(item);
    },

    updateItem(updatedItem) {
      const index = this.items.findIndex(
        (item) => String(item.ItemNumber) === String(updatedItem.ItemNumber)
      );

      if (index !== -1) {
        this.items[index] = updatedItem;
      }
    },

    removeItem(itemNumber) {
      this.items = this.items.filter(
        (item) => String(item.ItemNumber) !== String(itemNumber)
      );
    },

    clearCache() {
      this.items = [];
      this.subTypes = [];
      this.statuses = [];
    },
  },
});