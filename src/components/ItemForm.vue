<template>
  <div class="container py-4">
    <h2 class="mb-4">{{ isEditMode ? "Edit Item" : "Create Item" }}</h2>

    <div v-if="loading" class="text-center py-4">
      Loading item...
    </div>

    <div v-else>
      <div v-if="errorMessage" class="alert alert-danger" role="alert">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="saveItem">
        <div class="row g-4">
          <div class="col-lg-8">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Item Number</label>
                <input
                  v-model="form.ItemNumber"
                  type="number"
                  class="form-control"
                  :readonly="isEditMode"
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Item Type</label>
                <input v-model="form.ItemType" type="text" class="form-control" />
              </div>

              <div class="col-md-6">
                <label class="form-label">Item Sub-type</label>
                <input v-model="form.ItemSubType" type="text" class="form-control" />
              </div>

              <div class="col-md-6">
                <label class="form-label">Price</label>
                <input
                  :value="formatCurrency(form.ItemAskingPrice)"
                  @input="handleCurrencyInput($event, 'ItemAskingPrice')"
                  type="text"
                  class="form-control"
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Item Cost</label>
                <input
                  :value="formatCurrency(form.ItemCost)"
                  @input="handleCurrencyInput($event, 'ItemCost')"
                  type="text"
                  class="form-control"
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Item Status</label>
                <select v-model="form.ItemStatus" class="form-select">
                  <option value="A">Available</option>
                  <option value="S">Sold</option>
                  <option value="R">Replace</option>
                  <option value="K">Kept</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label">Item Color</label>
                <input v-model="form.ItemColor" type="text" class="form-control" />
              </div>

              <div class="col-12">
                <label class="form-label">Item Description</label>
                <textarea
                  v-model="form.ItemDescription"
                  class="form-control"
                  rows="4"
                ></textarea>
              </div>

              <div class="col-12 d-flex gap-2">
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  {{ saving ? "Saving..." : "Save Item" }}
                </button>

                <button type="button" class="btn btn-secondary" @click="cancelEdit">
                  Cancel
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

              <div class="mt-3">
                <label class="form-label">
                  {{ isEditMode ? "Replace Image" : "Add Image" }}
                </label>
                <input
                  type="file"
                  class="form-control"
                  accept="image/*"
                  @change="handleImageSelected"
                />
              </div>

              <div v-if="selectedImageFile" class="mt-2 small text-muted">
                Selected: {{ selectedImageFile.name }}
              </div>

              <div v-else-if="form.ItemImage" class="mt-2 small text-muted">
                Current: {{ form.ItemImage }}
              </div>

              <div v-if="resizedImageInfo" class="mt-2 small text-muted">
                Uploading resized image: {{ resizedImageInfo }}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import APIService from "@/api/APIService";

export default {
  name: "ItemForm",

  data() {
    return {
      loading: false,
      saving: false,
      errorMessage: "",
      selectedImageFile: null,
      selectedImagePreviewUrl: "",
      resizedImageInfo: "",
      form: {
        ItemNumber: "",
        ItemType: "",
        ItemSubType: "",
        ItemAskingPrice: "",
        ItemCost: "",
        ItemStatus: "A",
        ItemColor: "",
        ItemImage: "",
        ItemDescription: "",
      },
    };
  },

  computed: {
    isEditMode() {
      return !!this.$route.params.itemNumber;
    },

    previewImageUrl() {
      if (this.selectedImagePreviewUrl) {
        return this.selectedImagePreviewUrl;
      }

      if (!this.form.ItemImage) {
        return "";
      }

      return APIService.getImageUrl(this.form);
    },
  },

  methods: {
    async loadItem() {
      if (!this.isEditMode) return;

      this.loading = true;
      this.errorMessage = "";

      try {
        const itemNumber = this.$route.params.itemNumber;
        const data = await APIService.getItemById(itemNumber);
        this.form = { ...this.form, ...data };
      } catch (error) {
        this.errorMessage = error.message || "Failed to load item.";
      } finally {
        this.loading = false;
      }
    },

    handleImageSelected(event) {
      const file =
        event.target.files && event.target.files[0]
          ? event.target.files[0]
          : null;

      this.selectedImageFile = file;
      this.resizedImageInfo = "";

      if (this.selectedImagePreviewUrl) {
        URL.revokeObjectURL(this.selectedImagePreviewUrl);
        this.selectedImagePreviewUrl = "";
      }

      if (file) {
        this.selectedImagePreviewUrl = URL.createObjectURL(file);
      }
    },

    async resizeImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
      if (!file) return null;

      const imageBitmap = await createImageBitmap(file);

      let { width, height } = imageBitmap;
      const ratio = Math.min(maxWidth / width, maxHeight / height, 1);

      const newWidth = Math.round(width * ratio);
      const newHeight = Math.round(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(imageBitmap, 0, 0, newWidth, newHeight);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality)
      );

      if (!blob) {
        throw new Error("Failed to resize image.");
      }

      const baseName = file.name.replace(/\.[^.]+$/, "");
      return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
    },

    async getPreparedUploadFile() {
      if (!this.selectedImageFile) return null;

      const resizedFile = await this.resizeImage(this.selectedImageFile, 1200, 1200, 0.8);
      this.resizedImageInfo = `${resizedFile.name} (${Math.round(resizedFile.size / 1024)} KB)`;
      return resizedFile;
    },

    async saveItem() {
      this.saving = true;
      this.errorMessage = "";

      const itemNumber = Number(this.form.ItemNumber);
      const oldImageName = this.isEditMode ? this.form.ItemImage : "";
      let uploadedImageName = "";

      try {
        if (!itemNumber) {
          throw new Error("Item Number is required.");
        }

        if (this.isEditMode) {
          if (this.selectedImageFile) {
            const resizedFile = await this.getPreparedUploadFile();
            uploadedImageName = await APIService.uploadItemImage(
              resizedFile,
              itemNumber
            );
          }

          const updatePayload = {
            ...this.form,
            ItemImage: uploadedImageName || this.form.ItemImage,
          };

          try {
            await APIService.updateItem(itemNumber, updatePayload);
          } catch (dbError) {
            if (uploadedImageName) {
              try {
                await APIService.deleteItemImage(itemNumber, uploadedImageName);
              } catch (cleanupError) {
                console.error("Failed to clean up uploaded image:", cleanupError);
              }
            }
            throw dbError;
          }

          if (
            uploadedImageName &&
            oldImageName &&
            oldImageName !== uploadedImageName
          ) {
            try {
              await APIService.deleteItemImage(itemNumber, oldImageName);
            } catch (cleanupError) {
              console.error("Failed to remove old image:", cleanupError);
            }
          }
        } else {
          const createPayload = {
            ...this.form,
            ItemImage: "",
          };

          let createdItem = null;

          try {
            createdItem = await APIService.createItem(createPayload);

            if (this.selectedImageFile) {
              const resizedFile = await this.getPreparedUploadFile();
              uploadedImageName = await APIService.uploadItemImage(
                resizedFile,
                itemNumber
              );

              await APIService.updateItem(itemNumber, {
                ...createdItem,
                ...this.form,
                ItemImage: uploadedImageName,
              });
            }
          } catch (createError) {
            if (uploadedImageName) {
              try {
                await APIService.deleteItemImage(itemNumber, uploadedImageName);
              } catch (cleanupError) {
                console.error("Failed to clean up uploaded image:", cleanupError);
              }
            }

            if (createdItem) {
              try {
                await APIService.deleteItem(itemNumber);
              } catch (cleanupError) {
                console.error("Failed to clean up created item:", cleanupError);
              }
            }

            throw createError;
          }
        }

        this.$router.push("/itemList");
      } catch (error) {
        this.errorMessage = error.message || "Failed to save item.";
      } finally {
        this.saving = false;
      }
    },

    cancelEdit() {
      this.$router.push("/itemList");
    },

    handleCurrencyInput(event, field) {
      const raw = event.target.value.replace(/[^0-9.]/g, "");
      this.form[field] = raw ? parseFloat(raw) : "";
    },

    formatCurrency(value) {
      if (value == null || value === "") return "";

      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    },
  },

async mounted() {
  if (!this.isEditMode && this.$route.query.itemNumber) {
    this.form.ItemNumber = Number(this.$route.query.itemNumber);
  }

  await this.loadItem();
},

  beforeUnmount() {
    if (this.selectedImagePreviewUrl) {
      URL.revokeObjectURL(this.selectedImagePreviewUrl);
    }
  },
};
</script>

<style scoped>
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