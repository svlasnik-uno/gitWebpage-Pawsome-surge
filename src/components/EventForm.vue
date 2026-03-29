<template>
    <div class="container py-4 edit-event-page">
        <div class="row justify-content-center">
            <div class="col-12 col-lg-8">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h2 class="mb-4">
                            {{ isEditMode ? "Edit Event" : "Add Event" }}
                        </h2>

                        <div v-if="loading" class="text-center py-4">
                            Loading event...
                        </div>

                        <div v-else>
                            <div v-if="errorMessage" class="alert alert-danger" role="alert">
                                {{ errorMessage }}
                            </div>

                            <form @submit.prevent="saveEvent">
                                <div class="row g-3">
                                    <div class="col-md-4">
                                        <label for="id" class="form-label">Event ID</label>
                                        <input id="id" v-model.number="event.id" type="number" class="form-control"
                                            :disabled="isEditMode" required />
                                    </div>

                                    <div class="col-md-4">
                                        <label for="eventSeason" class="form-label">Season</label>
                                        <select id="eventSeason" v-model="event.eventSeason" class="form-select"
                                            required>
                                            <option value="">Select season</option>
                                            <option value="Spring">Spring</option>
                                            <option value="Summer">Summer</option>
                                            <option value="Fall">Fall</option>
                                            <option value="Winter">Winter</option>
                                        </select>
                                    </div>

                                    <div class="col-md-4">
                                        <label for="eventYear" class="form-label">Year</label>
                                        <input id="eventYear" v-model.number="event.eventYear" type="number"
                                            class="form-control" min="2000" max="2100" />
                                    </div>

                                    <div class="col-12">
                                        <label for="eventName" class="form-label">Event Name</label>
                                        <input id="eventName" v-model="event.eventName" type="text" class="form-control"
                                            required />
                                    </div>

                                    <div class="col-md-6">
                                        <label for="eventDate" class="form-label">Event Date</label>
                                        <input id="eventDate" v-model="event.eventDate" type="date"
                                            class="form-control" />
                                    </div>

                                    <div class="col-md-6">
                                        <label for="eventLocation" class="form-label">Location</label>
                                        <input id="eventLocation" v-model="event.eventLocation" type="text"
                                            class="form-control" />
                                    </div>

                                    <div class="col-md-6">
                                        <label for="eventDisplay" class="form-label">Display on Site (Y/N)</label>
                                        <input id="eventDisplay" v-model="event.eventDisplay" type="text"
                                            class="form-control" />
                                    </div>

                                    <div class="col-lg-6">
                                        <div class="image-preview-card">
                                            <h5 class="mb-3">Event Image</h5>

                                            <div class="image-preview-box">
                                                <img v-if="selectedImagePreviewUrl" :src="selectedImagePreviewUrl"
                                                    alt="Event preview" class="preview-image" />
                                                <div v-else class="text-muted">
                                                    No image available
                                                </div>
                                            </div>

                                            <div class="mt-3">
                                                <label class="form-label">
                                                    {{ isEditMode ? "Replace Image" : "Add Image" }}
                                                </label>
                                                <input type="file" class="form-control" accept="image/*"
                                                    @change="handleImageSelected" />
                                            </div>

                                            <div v-if="selectedImageFile" class="mt-2 small text-muted">
                                                Selected: {{ selectedImageFile.name }}
                                            </div>

                                            <div v-else-if="event.eventImage" class="mt-2 small text-muted">
                                                Current: {{ event.eventImage }}
                                            </div>

                                            <div v-if="resizedImageInfo" class="mt-2 small text-muted">
                                                Uploading resized image: {{ resizedImageInfo }}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex gap-2 mt-4 flex-wrap">
                                    <button type="submit" class="btn btn-primary" :disabled="saving">
                                        {{ saving ? "Saving..." : "Save Event" }}
                                    </button>

                                    <button type="button" class="btn btn-outline-secondary" @click="cancelEdit"
                                        :disabled="saving">
                                        Cancel
                                    </button>
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
import { useAuthStore } from "@/store/AuthStore";

export default {
    name: "EventForm",

    data() {
        return {
            event: {
                id: null,
                eventName: "",
                eventDate: "",
                eventLocation: "",
                eventImage: "",
                eventSeason: "",
                eventYear: "",
                eventDisplay: "",
            },
            selectedImageFile: null,
            selectedImagePreviewUrl: "",
            resizedImageInfo: "",
            loading: false,
            saving: false,
            errorMessage: "",
            auth: null,
        };
    },

    computed: {
        isEditMode() {
            return !!this.$route.params.id;
        },
        eventId() {
            return this.$route.params.id || this.$route.query.id || null;
        },
    },

    methods: {
        async loadEvent() {
            if (!this.eventId) return;

            this.loading = true;
            this.errorMessage = "";

            try {
                const data = await APIService.getEventById(this.eventId);

                this.event = {
                    id: data.id,
                    eventName: data.eventName || "",
                    eventDate: this.formatDateForInput(data.eventDate) || "",
                    eventLocation: data.eventLocation || "",
                    eventImage: data.eventImage || "",
                    eventSeason: data.eventSeason || "",
                    eventYear: data.eventYear || "",
                    eventDisplay: data.eventDisplay || "",
                };

                if (this.event.eventImage) {
                    this.selectedImagePreviewUrl = APIService.getEventImageUrl(this.event);
                }
            } catch (error) {
                this.errorMessage = error.message || "Failed to load event.";
            } finally {
                this.loading = false;
            }
        },

        formatDateForInput(value) {
            if (!value) return "";
            return String(value).slice(0, 10);
        },

        handleImageSelected(e) {
            const file = e.target.files?.[0] || null;
            this.selectedImageFile = file;
            this.resizedImageInfo = "";

            if (!file) return;

            if (this.selectedImagePreviewUrl && this.selectedImagePreviewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(this.selectedImagePreviewUrl);
            }

            this.selectedImagePreviewUrl = URL.createObjectURL(file);
        },

        async resizeImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.85) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = (readerEvent) => {
                    const img = new Image();

                    img.onload = () => {
                        let { width, height } = img;

                        const scale = Math.min(maxWidth / width, maxHeight / height, 1);
                        const targetWidth = Math.round(width * scale);
                        const targetHeight = Math.round(height * scale);

                        const canvas = document.createElement("canvas");
                        canvas.width = targetWidth;
                        canvas.height = targetHeight;

                        const ctx = canvas.getContext("2d");
                        if (!ctx) {
                            reject(new Error("Could not create canvas context."));
                            return;
                        }

                        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                        const originalName = file.name.replace(/\.[^.]+$/, "");
                        const outputName = `${originalName}.jpg`;

                        canvas.toBlob(
                            (blob) => {
                                if (!blob) {
                                    reject(new Error("Image resize failed."));
                                    return;
                                }

                                const resizedFile = new File([blob], outputName, {
                                    type: "image/jpeg",
                                    lastModified: Date.now(),
                                });

                                resolve(resizedFile);
                            },
                            "image/jpeg",
                            quality
                        );
                    };

                    img.onerror = () => reject(new Error("Failed to load image for resizing."));
                    img.src = readerEvent.target.result;
                };

                reader.onerror = () => reject(new Error("Failed to read image file."));
                reader.readAsDataURL(file);
            });
        },

        async getPreparedUploadFile() {
            if (!this.selectedImageFile) return null;

            const resizedFile = await this.resizeImage(this.selectedImageFile, 1200, 1200, 0.85);
            this.resizedImageInfo = `${resizedFile.name} (${Math.round(resizedFile.size / 1024)} KB)`;
            return resizedFile;
        },

        async saveEvent() {
            this.saving = true;
            this.errorMessage = "";
            this.resizedImageInfo = "";

            const eventId = Number(this.event.id);
            const oldImageName = this.isEditMode ? this.event.eventImage : "";
            let uploadedImageName = "";

            try {
                if (!eventId) {
                    throw new Error("Event ID is required.");
                }

                const payload = {
                    id: this.event.id,
                    eventName: this.event.eventName,
                    eventDate: this.event.eventDate || null,
                    eventLocation: this.event.eventLocation,
                    eventImage: this.event.eventImage,
                    eventSeason: this.event.eventSeason,
                    eventYear: this.event.eventYear || null,
                    eventDisplay: this.event.eventDisplay,
                };

                if (this.isEditMode) {
                    if (this.selectedImageFile) {
                        const resizedFile = await this.getPreparedUploadFile();
                        uploadedImageName = await APIService.uploadEventImage(resizedFile, eventId);
                        payload.eventImage = uploadedImageName;
                    }

                    try {
                        await APIService.updateEvent(eventId, payload);
                    } catch (dbError) {
                        if (uploadedImageName) {
                            try {
                                await APIService.deleteEventImage(eventId, uploadedImageName);
                            } catch (cleanupError) {
                                console.error("Failed to clean up uploaded image:", cleanupError);
                            }
                        }
                        throw dbError;
                    }

                    if (uploadedImageName && oldImageName && oldImageName !== uploadedImageName) {
                        try {
                            await APIService.deleteEventImage(eventId, oldImageName);
                        } catch (cleanupError) {
                            console.error("Failed to remove old image:", cleanupError);
                        }
                    }
                } else {
                    let createdEvent = null;

                    try {
                        createdEvent = await APIService.createEvent({
                            ...payload,
                            eventImage: "",
                        });

                        if (this.selectedImageFile) {
                            const resizedFile = await this.getPreparedUploadFile();
                            uploadedImageName = await APIService.uploadEventImage(resizedFile, eventId);

                            await APIService.updateEvent(eventId, {
                                ...payload,
                                eventImage: uploadedImageName,
                            });
                        }
                    } catch (createError) {
                        if (uploadedImageName) {
                            try {
                                await APIService.deleteEventImage(eventId, uploadedImageName);
                            } catch (cleanupError) {
                                console.error("Failed to clean up uploaded image:", cleanupError);
                            }
                        }

                        if (createdEvent) {
                            try {
                                await APIService.deleteEvent(eventId);
                            } catch (cleanupError) {
                                console.error("Failed to clean up created event:", cleanupError);
                            }
                        }

                        throw createError;
                    }
                }

                this.$router.push("/eventListAdmin");
            } catch (error) {
                this.errorMessage = error.message || "Failed to save event.";
            } finally {
                this.saving = false;
            }
        },

        cancelEdit() {
            this.$router.push("/eventListAdmin");
        },
    },

    async mounted() {
        this.auth = useAuthStore();

        if (!this.auth.isAuthenticated) {
            window.alert("You must be logged in to manage events.");
            this.$router.push("/");
            return;
        }

        if (this.isEditMode) {
            await this.loadEvent();
        }
    },

    beforeUnmount() {
        if (this.selectedImagePreviewUrl && this.selectedImagePreviewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(this.selectedImagePreviewUrl);
        }
    },
};
</script>

<style scoped>
.edit-event-page {
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.image-preview-card {
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    padding: 1rem;
    height: 100%;
}

.image-preview-box {
    width: 100%;
    max-width: 320px;
    aspect-ratio: 1 / 1;
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
}

.preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}
</style>