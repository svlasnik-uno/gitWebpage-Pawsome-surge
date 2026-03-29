<template>
  <div class="container py-4">
    <h2 class="mb-4">Item Detail</h2>

    <div v-if="loading" class="text-center py-4">
      Loading item...
    </div>

    <div v-else>
      <div v-if="errorMessage" class="alert alert-danger" role="alert">
        {{ errorMessage }}
      </div>

      <div class="row g-4" v-else>
        <div class="col-lg-8">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Item Number</label>
              <div class="form-control readonly-field">{{ form.ItemNumber || "" }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label">Item Type</label>
              <div class="form-control readonly-field">{{ form.ItemType || "" }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label">Item Sub-type</label>
              <div class="form-control readonly-field">{{ form.ItemSubType || "" }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label">Price</label>
              <div class="form-control readonly-field">{{ formatCurrency(form.ItemAskingPrice) }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label">Item Cost</label>
              <div class="form-control readonly-field">{{ formatCurrency(form.ItemCost) }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label">Item Status</label>
              <div class="form-control readonly-field">{{ formatStatus(form.ItemStatus) }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label">Item Color</label>
              <div class="form-control readonly-field">{{ form.ItemColor || "" }}</div>
            </div>

            <div class="col-12">
              <label class="form-label">Item Description</label>
              <div class="form-control readonly-field readonly-textarea">{{ form.ItemDescription || "" }}</div>
            </div>

            <div class="col-12 d-flex gap-2">
              <button type="button" class="btn btn-secondary" @click="goBack">
                Back to List
              </button>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="image-preview-card">
            <h5 class="mb-3">Item Image</h5>

            <div class="image-preview-box">
              <img
                v-if="previewImageUrl"
                :src="previewImageUrl"
                alt="Item preview"
                class="img-fluid preview-image"
              />
              <div v-else class="text-muted">
                No image available
              </div>
            </div>

            <div v-if="form.ItemImage" class="mt-2 small text-muted">
              Current: {{ form.ItemImage }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import APIService from "@/api/APIService";

export default {
  name: "ItemDetail",

  props: {
    ItemNumber: {
      type: [String, Number],
      default: "",
    },
  },

  data() {
    return {
      loading: false,
      errorMessage: "",
      form: {
        ItemNumber: "",
        ItemType: "",
        ItemSubType: "",
        ItemAskingPrice: "",
        ItemCost: "",
        ItemStatus: "",
        ItemColor: "",
        ItemImage: "",
        ItemDescription: "",
      },
    };
  },

  computed: {
    resolvedItemNumber() {
      return this.ItemNumber || this.$route.params.itemNumber;
    },

    previewImageUrl() {
      if (!this.form.ItemImage) {
        return "";
      }

      return APIService.getImageUrl(this.form);
    },
  },

  methods: {
    async loadItem() {
      if (!this.resolvedItemNumber) {
        this.errorMessage = "No item number provided.";
        return;
      }

      this.loading = true;
      this.errorMessage = "";

      try {
        const data = await APIService.getItemById(this.resolvedItemNumber);
        this.form = { ...this.form, ...data };
      } catch (error) {
        this.errorMessage = error.message || "Failed to load item.";
      } finally {
        this.loading = false;
      }
    },

    goBack() {
      this.$router.push("/itemList");
    },

    formatCurrency(value) {
      if (value == null || value === "") return "";

      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    },

    formatStatus(value) {
      const statusMap = {
        A: "Available",
        S: "Sold",
        R: "Replace",
        K: "Kept",
      };

      return statusMap[value] || value || "";
    },
  },

  async mounted() {
    await this.loadItem();
  },
};
</script>

<style scoped>
.readonly-field {
  background-color: #f8f9fa;
  min-height: calc(1.5em + 0.75rem + 2px);
  display: flex;
  align-items: center;
}

.readonly-textarea {
  min-height: 120px;
  white-space: pre-wrap;
  align-items: flex-start;
  padding-top: 0.375rem;
}

.image-preview-card {
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1rem;
  background: #fff;
}

.image-preview-box {
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #ced4da;
  border-radius: 0.5rem;
  background: #f8f9fa;
  padding: 0.75rem;
  text-align: center;
}

.preview-image {
  max-height: 320px;
  width: auto;
  object-fit: contain;
  border-radius: 0.375rem;
}
</style>