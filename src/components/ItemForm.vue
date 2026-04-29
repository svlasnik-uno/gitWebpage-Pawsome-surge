<template>
  <div class="container py-4 edit-item-page">
    <div class="row justify-content-center">
      <div class="col-12 col-xl-10">
        <div class="card shadow-sm">
          <div class="card-body">
            <h2 class="mb-4">{{ isEditMode ? "Edit Item" : "Create Item" }}</h2>

            <div v-if="loading" class="text-center py-4">
              Loading item...
            </div>

            <div v-else>
              <div v-if="errorMessage" class="alert alert-danger" role="alert">
                {{ errorMessage }}
              </div>

              <form @submit.prevent="saveItem">
                <div class="row g-4 form-layout">
                  <div class="col-12 col-lg-7 order-2 order-lg-1">
                    <div class="row g-3">
                      <div class="col-12 col-sm-6 col-md-5">
                        <label for="itemNumber" class="form-label">Item Number</label>
                        <input id="itemNumber" v-model="form.ItemNumber" type="number"
                          class="form-control mobile-form-control" :readonly="isEditMode" />
                      </div>

                      <div class="col-12 col-sm-6 col-md-6">
                        <label for="itemType" class="form-label">Item Type</label>
                        <select id="itemType" v-model="form.ItemType" class="form-select mobile-form-control">
                          <option value="">Select type</option>
                          <option v-for="option in TypeOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                          </option>
                        </select>
                      </div>

                      <div class="col-12 col-sm-6 col-md-6">
                        <label for="itemSubType" class="form-label">Item Sub-type</label>
                        <select id="itemSubType" v-model="form.ItemSubType" class="form-select mobile-form-control">
                          <option value="">Select sub-type</option>
                          <option v-for="option in subTypeOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                          </option>
                        </select>
                      </div>

                      <div class="col-12 col-sm-6 col-md-6">
                        <label for="itemPrice" class="form-label">Price</label>
                        <div class="input-group">
                          <span class="input-group-text mobile-input-group-text">$</span>
                          <input id="itemPrice" v-model.number="form.ItemAskingPrice" type="number" step="0.01" min="0"
                            class="form-control mobile-form-control" />
                        </div>
                      </div>

                      <div class="col-12 col-sm-6 col-md-6">
                        <label for="itemCost" class="form-label">Item Cost</label>
                        <div class="input-group">
                          <span class="input-group-text mobile-input-group-text">$</span>
                          <input id="itemCost" v-model.number="form.ItemCost" type="number" step="0.01" min="0"
                            class="form-control mobile-form-control" />
                        </div>
                      </div>

                      <div class="col-12 col-sm-6 col-md-6">
                        <label for="itemStatus" class="form-label">Item Status</label>
                        <select id="itemStatus" v-model="form.ItemStatus" class="form-select mobile-form-control">
                          <option value="">Select status</option>
                          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                          </option>
                        </select>
                      </div>

                      <div class="col-12 col-sm-6 col-md-6">
                        <label for="itemColor" class="form-label">Item Color</label>
                        <input id="itemColor" v-model="form.ItemColor" type="text"
                          class="form-control mobile-form-control" />
                      </div>

                      <div class="col-12 col-sm-6 col-md-6">
                        <label for="imageType" class="form-label">Image Type</label>
                        <input id="imageType" v-model="form.ImageType" type="text"
                          class="form-control mobile-form-control" />
                      </div>

                      <div class="col-12">
                        <label for="itemDescription" class="form-label">Item Description</label>
                        <textarea id="itemDescription" v-model="form.ItemDescription"
                          class="form-control mobile-form-control" rows="4"></textarea>
                      </div>
                    </div>
                  </div>

                  <div class="col-12 col-lg-4 order-1 order-lg-2">
                    <div class="image-preview-card">
                      <h5 class="mb-3">Item Image</h5>

                      <div class="image-preview-box">
                        <img v-if="previewImageUrl" :src="previewImageUrl" alt="Item preview" class="preview-image" />
                        <div v-else class="text-muted">
                          No image available
                        </div>
                      </div>

                      <div class="mt-3">
                        <label class="form-label">
                          {{ isEditMode ? "Replace Image" : "Add Image" }}
                        </label>
                        <input type="file" class="form-control mobile-form-control" accept="image/*"
                          @change="handleImageSelected" />
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

                  <div class="col-12 order-3">
                    <div class="d-flex gap-2 mt-2 flex-wrap form-actions">
                      <button type="submit" class="btn btn-secondary" :disabled="saving">
                        {{ saving ? "Saving..." : "Save Item" }}
                      </button>

                      <button v-if="isEditMode" type="button" class="btn btn-secondary" @click="confirmDelete" title="Delete Item"
                        :disabled="saving">
                        Delete Item
                      </button>

                      <button type="button" class="btn btn-secondary" @click="goBackCancel" :disabled="saving">
                        Back to List
                      </button>

                      <button type="button" class="btn btn-secondary" @click="goBackCancel" :disabled="saving">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import APIService from "@/api/APIService";
import { useItemStore } from "@/store/ItemStore";

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
      initialFormSnapshot: "",
      initialSelectedImageName: "",
      itemStore: null,
      form: {
        ItemNumber: "",
        ItemType: "",
        ItemSubType: "",
        ItemAskingPrice: "",
        ItemCost: "",
        ItemStatus: "A",
        ImageType: "",
        ItemColor: "",
        ItemImage: "",
        ItemDescription: "",
      },
      TypeOptions: [
        { value: "Flowers", label: "Flowers" },
        { value: "Crochet", label: "Crochet" },
        { value: "Other", label: "Other" },
      ],
      subTypeOptions: [],
      statusOptions: [],
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

    hasUnsavedChanges() {
      const currentFormSnapshot = JSON.stringify(this.form);
      const currentSelectedImageName = this.selectedImageFile
        ? this.selectedImageFile.name
        : "";

      return (
        currentFormSnapshot !== this.initialFormSnapshot ||
        currentSelectedImageName !== this.initialSelectedImageName
      );
    },
  },

  methods: {
    captureInitialState() {
      this.initialFormSnapshot = JSON.stringify(this.form);
      this.initialSelectedImageName = this.selectedImageFile
        ? this.selectedImageFile.name
        : "";
    },

    async loadItem() {
      if (!this.isEditMode) return;

      this.loading = true;
      this.errorMessage = "";

      try {
        const itemNumber = this.$route.params.itemNumber;
        const data = await this.itemStore.fetchItemById(itemNumber);
        this.form = { ...this.form, ...data };
      } catch (error) {
        this.errorMessage = error.message || "Failed to load item.";
      } finally {
        this.loading = false;
      }
    },

    async loadSubTypes() {
      try {
        const subTypesFromApi = await this.itemStore.fetchSubTypes();

        this.subTypeOptions = subTypesFromApi
          .filter((subType) => subType?.subTypeName)
          .map((subType) => ({
            value: subType.subTypeName,
            label: subType.subTypeName,
          }));
      } catch (error) {
        console.error("Failed to load item sub-types:", error);
      }
    },

    async loadStatusOptions() {
      try {
        const statusesFromApi = await this.itemStore.fetchStatuses();

        this.statusOptions = statusesFromApi
          .filter((status) => status?.statusOption)
          .map((status) => ({
            value: status.statusOption,
            label: status.statusLabel,
          }));
      } catch (error) {
        console.error("Failed to load item statuses:", error);
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

    async getPreparedUploadFile(file, height, width, quality) {
      if (!this.selectedImageFile) return null;

      const resizedFile = await this.resizeImage(file, height, width, quality);
      this.resizedImageInfo = `${resizedFile.name} (${Math.round(
        resizedFile.size / 1024
      )} KB)`;
      return resizedFile;
    },

    validateForm() {
      const requiredFields = [
        { key: "ItemNumber", label: "Item Number" },
        { key: "ItemType", label: "Item Type" },
        { key: "ItemSubType", label: "Item Sub-type" },
        { key: "ItemAskingPrice", label: "Price" },
        { key: "ItemStatus", label: "Item Status" },
        { key: "ItemColor", label: "Item Color" },
        { key: "ItemDescription", label: "Item Description" },
      ];

      const missingFields = requiredFields
        .filter(({ key }) => {
          const value = this.form[key];
          return value === null || value === undefined || String(value).trim() === "";
        })
        .map(({ label }) => label);

      if (missingFields.length) {
        this.errorMessage = `Please complete the required fields: ${missingFields.join(
          ", "
        )}.`;
        return false;
      }

      return true;
    },

    async saveItem() {
      this.errorMessage = "";

      if (!this.validateForm()) {
        return;
      }

      this.saving = true;
      const itemNumber = Number(this.form.ItemNumber);
      let uploadedImageName = "";

      try {
        if (!itemNumber) {
          throw new Error("Item Number is required.");
        }

        if (this.isEditMode) {
          const oldImageName = this.form.ItemImage || "";
          let finalImageName = oldImageName;

          if (this.selectedImageFile) {
            const resizedFile = await this.getPreparedUploadFile(this.selectedImageFile, 600, 600, 0.8 );
            const thumbFile = await this.getPreparedUploadFile(this.selectedImageFile, 300, 300, 0.8 );

            uploadedImageName = await APIService.uploadItemImage(
              resizedFile,
              thumbFile,
              itemNumber
            );
            finalImageName = uploadedImageName;
          }

          const updatePayload = {
            ...this.form,
            ItemImage: finalImageName,
          };

          let savedItem;

          try {
            savedItem = await APIService.updateItem(itemNumber, updatePayload);
          } catch (dbError) {
            if (uploadedImageName && uploadedImageName !== oldImageName) {
              await APIService.deleteItemImage(itemNumber, uploadedImageName);
              await APIService.deleteItemImage(
                itemNumber,
                `thumbs/${uploadedImageName}`
              );
            }
            throw dbError;
          }

          if (
            this.selectedImageFile &&
            oldImageName &&
            uploadedImageName &&
            oldImageName !== uploadedImageName
          ) {
            await APIService.deleteItemImage(itemNumber, oldImageName);
            await APIService.deleteItemImage(itemNumber, `thumbs/${oldImageName}`);
          }

          this.form.ItemImage = finalImageName;

          this.itemStore.updateItem(
            savedItem || {
              ...updatePayload,
              ItemImage: finalImageName,
            }
          );
        } else {
          const createPayload = {
            ...this.form,
            ItemImage: "",
          };

          let createdItem = null;
          let finalCreatedItem = null;

          try {
            createdItem = await APIService.createItem(createPayload);
            finalCreatedItem = createdItem;

            if (this.selectedImageFile) {
              const resizedFile = await this.getPreparedUploadFile(this.selectedImageFile, 600, 600, 0.8);
              const thumbFile = await this.getPreparedUploadFile(this.selectedImageFile, 300, 300, 0.8 );

              uploadedImageName = await APIService.uploadItemImage(
                resizedFile,
                thumbFile,
                itemNumber
              );

              finalCreatedItem = await APIService.updateItem(itemNumber, {
                ...createdItem,
                ...this.form,
                ItemImage: uploadedImageName,
              });
            }
          } catch (createError) {
            if (uploadedImageName) {
              try {
                await APIService.deleteItemImage(itemNumber, uploadedImageName);
                await APIService.deleteItemImage(
                  itemNumber,
                  `thumbs/${uploadedImageName}`
                );
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

          this.itemStore.addItem(
            finalCreatedItem || {
              ...this.form,
              ItemNumber: itemNumber,
              ItemImage: uploadedImageName || "",
            }
          );
        }

        this.captureInitialState();

        this.$router.push({
          path: "/itemList",
          query: { ...this.$route.query },
        });
      } catch (error) {
        this.errorMessage = error.message || "Failed to save item.";
      } finally {
        this.saving = false;
      }
    },

    async confirmDelete() {
      if (!this.isEditMode) return;

      const ok = window.confirm(
        `Are you sure you want to delete item #${this.form.ItemNumber}?`
      );
      if (!ok) return;

      try {
        const filename = this.form.ItemImage;

        if (filename) {
          await APIService.deleteItemImage(this.form.ItemNumber, filename);
          await APIService.deleteItemImage(
            this.form.ItemNumber,
            `thumbs/${filename}`
          );
        }
      } catch (error) {
        window.alert(error.message || "Delete image failed.");
        return;
      }

      try {
        await APIService.deleteItem(this.form.ItemNumber);
        this.itemStore.removeItem(this.form.ItemNumber);

        this.$router.push({
          path: "/itemList",
          query: { ...this.$route.query },
        });
      } catch (error) {
        window.alert(error.message || "Delete failed.");
      }
    },

    goBackCancel() {
      if (this.hasUnsavedChanges) {
        const confirmed = window.confirm(
          "You have unsaved changes. Are you sure you want to cancel and lose your updates?"
        );

        if (!confirmed) {
          return;
        }
      }

      this.$router.push({
        path: "/itemList",
        query: { ...this.$route.query },
      });
    },

    handleBeforeUnload(event) {
      if (!this.hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    },

    async resizeAllItemImages() {
      this.errorMessage = "";
      this.saving = true;

      let results = {
        total: 0,
        processed: 0,
        skipped: 0,
        failed: 0,
      };

      try {
        const items = await APIService.getItems();
        const itemList = Array.isArray(items) ? items : [];

        results.total = itemList.length;

        for (const item of itemList) {
          try {
            const itemNumber = Number(item.ItemNumber);
            const oldImageName = item.ItemImage;

            if (!itemNumber || !oldImageName) {
              results.skipped++;
              continue;
            }

            const originalFile = await this.getItemImageFile(item);

            if (!originalFile) {
              results.skipped++;
              continue;
            }

            const resizedFile = await this.resizeImage(originalFile, 1200, 1200, 0.8);

            const uploadedImageName = await APIService.uploadItemImage(
              resizedFile,
              itemNumber
            );

            try {
              await APIService.updateItem(itemNumber, {
                ...item,
                ItemImage: uploadedImageName,
              });
            } catch (dbError) {
              if (uploadedImageName) {
                try {
                  await APIService.deleteItemImage(itemNumber, uploadedImageName);
                } catch (cleanupError) {
                  console.error(
                    `Failed cleanup for item ${itemNumber}:`,
                    cleanupError
                  );
                }
              }
              throw dbError;
            }

            if (
              uploadedImageName &&
              oldImageName &&
              uploadedImageName !== oldImageName
            ) {
              try {
                await APIService.deleteItemImage(itemNumber, oldImageName);
              } catch (cleanupError) {
                console.error(
                  `Failed to remove old image for item ${itemNumber}:`,
                  cleanupError
                );
              }
            }

            results.processed++;
          } catch (itemError) {
            results.failed++;
            console.error(
              `Failed processing item ${item?.ItemNumber}:`,
              itemError
            );
          }
        }

        window.alert(
          `Image resize complete.\n` +
          `Total: ${results.total}\n` +
          `Processed: ${results.processed}\n` +
          `Skipped: ${results.skipped}\n` +
          `Failed: ${results.failed}`
        );
      } catch (error) {
        console.error("Bulk image resize failed:", error);
        this.errorMessage = error.message || "Failed to bulk resize item images.";
      } finally {
        this.saving = false;
      }
    },

    async getItemImageFile(item) {
      if (!item?.ItemImage) return null;

      const imageUrl = APIService.getImageUrl(item);
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch image for item ${item.ItemNumber}`);
      }

      const blob = await response.blob();

      const originalName = item.ItemImage || `item-${item.ItemNumber}.jpg`;
      const extension =
        blob.type === "image/png"
          ? ".png"
          : blob.type === "image/webp"
            ? ".webp"
            : ".jpg";

      const baseName =
        originalName.replace(/\.[^.]+$/, "") || `item-${item.ItemNumber}`;

      return new File([blob], `${baseName}${extension}`, {
        type: blob.type || "image/jpeg",
      });
    },
  },

  async mounted() {
    this.itemStore = useItemStore();

    if (!this.isEditMode && this.$route.query.itemNumber) {
      this.form.ItemNumber = Number(this.$route.query.itemNumber);
    }

    await this.loadItem();
    await this.loadSubTypes();
    await this.loadStatusOptions();

    this.captureInitialState();
    window.addEventListener("beforeunload", this.handleBeforeUnload);
  },

  beforeUnmount() {
    if (this.selectedImagePreviewUrl) {
      URL.revokeObjectURL(this.selectedImagePreviewUrl);
    }

    window.removeEventListener("beforeunload", this.handleBeforeUnload);
  },
};
</script>

<style scoped>
.edit-item-page {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.image-preview-card {
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1rem;
  height: 100%;
  background: #fff;
}

.image-preview-box {
  width: 100%;
  min-height: 360px;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  padding: 0.75rem;
  text-align: center;
}

.preview-image {
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  display: block;
  border-radius: 0.375rem;
}

/* Tablet */
@media (max-width: 991.98px) {
  .edit-item-page .card-body {
    padding: 1rem;
  }

  .image-preview-box {
    min-height: 220px;
  }
}

/* Mobile */
@media (max-width: 575.98px) {
  .mobile-form-control {
    min-height: 44px;
    font-size: 16px;
  }

  .mobile-input-group-text {
    min-height: 44px;
    font-size: 16px;
  }

  .form-actions {
    position: sticky;
    bottom: 0;
    z-index: 10;
    background: #fff;
    padding: 0.75rem;
    border-top: 1px solid #dee2e6;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
  }

  .form-layout {
    padding-bottom: 90px;
  }

  .image-preview-card {
    padding: 0.875rem;
  }

  .image-preview-box {
    min-height: 180px;
    padding: 0.5rem;
  }

  .preview-image {
    max-height: 280px;
  }
}
</style>