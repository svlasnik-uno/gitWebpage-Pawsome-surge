import { defineStore } from "pinia";
import APIService from "@/api/APIService";

export const useItemStore = defineStore("itemStore", {
  state: () => ({
    items: [],
    subTypes: [],
    statuses: [],
    queryCache: {},
    itemLookup: {},
    hasLoadedAllItems: false,
  }),

  actions: {
    setItems(items) {
      this.items = Array.isArray(items) ? items : [];
      this.buildItemLookup(this.items);
      this.hasLoadedAllItems = true;
    },

    setSubTypes(subTypes) {
      this.subTypes = Array.isArray(subTypes) ? subTypes : [];
    },

    setStatuses(statuses) {
      this.statuses = Array.isArray(statuses) ? statuses : [];
    },

    buildItemLookup(items) {
      this.itemLookup = {};
      Array.isArray(items) &&
        items.forEach((item) => {
          if (item && item.ItemNumber != null) {
            this.itemLookup[String(item.ItemNumber)] = item;
          }
        });
    },

    getItemFromCache(itemNumber) {
      return itemNumber ? this.itemLookup[String(itemNumber)] || null : null;
    },

    cacheQuery(key, items) {
      if (!key) return;
      this.queryCache[key] = Array.isArray(items) ? items : [];
    },

    getCachedQuery(key) {
      return key ? this.queryCache[key] || null : null;
    },

    storeItem(item) {
      if (!item || item.ItemNumber == null) return;

      const key = String(item.ItemNumber);
      const index = this.items.findIndex(
        (existingItem) => String(existingItem.ItemNumber) === key
      );

      if (index !== -1) {
        this.items[index] = item;
      } else {
        this.items.push(item);
      }

      this.itemLookup[key] = item;
    },

    async fetchItems(forceReload = false) {
      if (!forceReload && this.items.length && this.hasLoadedAllItems) {
        return this.items;
      }

      const data = await APIService.getItems();
      this.setItems(Array.isArray(data) ? data : []);
      this.queryCache = {};
      return this.items;
    },

    async fetchSubTypes(forceReload = false) {
      if (!forceReload && this.subTypes.length) {
        return this.subTypes;
      }

      const data = await APIService.getItemSubTypes();
      this.subTypes = Array.isArray(data) ? data : [];
      return this.subTypes;
    },

    async fetchStatuses(forceReload = false) {
      if (!forceReload && this.statuses.length) {
        return this.statuses;
      }

      const data = await APIService.getItemStatuses();
      this.statuses = Array.isArray(data) ? data : [];
      return this.statuses;
    },

    async fetchAvailableItems(forceReload = false) {
      const cacheKey = "available:AW";
      const cached = this.getCachedQuery(cacheKey);
      if (!forceReload && cached) {
        return cached;
      }

      if (!forceReload && this.hasLoadedAllItems) {
        const items = this.items
          .filter((item) => item.ItemStatus === "AW")
          .sort((a, b) => Number(a.ItemNumber) - Number(b.ItemNumber));
        this.cacheQuery(cacheKey, items);
        return items;
      }

      const data = await APIService.getItemsSortCriteria(
        [{ column: "ItemNumber", ascending: true }],
        [{ column: "ItemStatus", operator: "eq", value: "AW" }]
      );
      const items = Array.isArray(data) ? data : [];
      items.forEach(this.storeItem);
      this.cacheQuery(cacheKey, items);
      return items;
    },

    async fetchItemById(itemNumber, useCache = true) {
      if (!itemNumber) return null;

      const normalized = String(itemNumber);
      if (useCache) {
        const cachedItem = this.getItemFromCache(normalized);
        if (cachedItem) return cachedItem;
      }

      const results = await this.fetchItemsByIds([normalized], useCache);
      return results[0] || null;
    },

    async fetchItemsByIds(itemNumbers, useCache = true) {
      const ids = Array.isArray(itemNumbers) ? itemNumbers : [itemNumbers];
      const normalizedIds = Array.from(
        new Set(
          ids
            .map((id) => String(id).trim())
            .filter((id) => id.length)
        )
      );

      if (!normalizedIds.length) return [];

      const cachedItems = useCache
        ? normalizedIds
            .map((id) => this.getItemFromCache(id))
            .filter(Boolean)
        : [];

      const missingIds = normalizedIds.filter(
        (id) => !cachedItems.some((item) => String(item.ItemNumber) === id)
      );

      if (!missingIds.length) {
        return cachedItems;
      }

      const data = await APIService.getItemsByIds(missingIds);
      const items = Array.isArray(data) ? data : [];
      items.forEach(this.storeItem);
      return [...cachedItems, ...items];
    },

    async fetchItemsByImageType(imageType, forceReload = false) {
      const cacheKey = `imageType:${imageType}`;
      const cached = this.getCachedQuery(cacheKey);
      if (!forceReload && cached) {
        return cached;
      }

      if (!forceReload && this.hasLoadedAllItems) {
        const items = this.items.filter(
          (item) => item.ImageType === imageType
        );
        this.cacheQuery(cacheKey, items);
        return items;
      }

      const data = await APIService.getItemsByImageType(imageType);
      const items = Array.isArray(data) ? data : [];
      items.forEach(this.storeItem);
      this.cacheQuery(cacheKey, items);
      return items;
    },

    async fetchItemsByStatus(status, forceReload = false) {
      const cacheKey = `status:${status}`;
      const cached = this.getCachedQuery(cacheKey);
      if (!forceReload && cached) {
        return cached;
      }

      if (!forceReload && this.hasLoadedAllItems) {
        const items = this.items.filter(
          (item) => item.ItemStatus === status
        );
        this.cacheQuery(cacheKey, items);
        return items;
      }

      const data = await APIService.getItemsByStatus(status);
      const items = Array.isArray(data) ? data : [];
      items.forEach(this.storeItem);
      this.cacheQuery(cacheKey, items);
      return items;
    },

    async fetchItemsSortCriteria(sortCriteria, filterCriteria) {
      const cacheKey = `sort:${JSON.stringify(sortCriteria)}|filter:${JSON.stringify(filterCriteria)}`;
      const cached = this.getCachedQuery(cacheKey);
      if (cached) {
        return cached;
      }

      const data = await APIService.getItemsSortCriteria(sortCriteria, filterCriteria);
      const items = Array.isArray(data) ? data : [];
      items.forEach(this.storeItem);
      this.cacheQuery(cacheKey, items);
      return items;
    },

    addItem(item) {
      this.storeItem(item);
      this.queryCache = {};
    },

    updateItem(updatedItem) {
      const index = this.items.findIndex(
        (item) => String(item.ItemNumber) === String(updatedItem.ItemNumber)
      );

      if (index !== -1) {
        this.items[index] = updatedItem;
      }

      this.storeItem(updatedItem);
      this.queryCache = {};
    },

    removeItem(itemNumber) {
      const normalized = String(itemNumber);
      this.items = this.items.filter(
        (item) => String(item.ItemNumber) !== normalized
      );
      delete this.itemLookup[normalized];
      this.queryCache = {};
    },

    clearCache() {
      this.items = [];
      this.subTypes = [];
      this.statuses = [];
      this.queryCache = {};
      this.itemLookup = {};
    },
  },
});