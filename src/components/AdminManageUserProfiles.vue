<template>
    <template v-if="auth.isAuthenticated && auth.usertype === 'admin'">
        <div class="container mt-4">
            <h3 class="mb-3">User Profiles</h3>

            <div v-if="loading" class="text-center py-4">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>

            <div v-else-if="error" class="alert alert-danger">
                {{ error }}
            </div>

            <div v-else class="table-responsive">
                <table class="table table-striped table-bordered align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>Email</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Phone</th>
                            <th>User Type</th>
                            <th style="width: 140px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="profile in profiles" :key="profile.id">
                            <td>{{ profile.useremail }}</td>

                            <td>
                                <span v-if="editingRowId !== profile.id">
                                    {{ profile.userfirstname }}
                                </span>
                                <input v-else v-model="editForm.userfirstname" type="text" class="form-control" />
                            </td>

                            <td>
                                <span v-if="editingRowId !== profile.id">
                                    {{ profile.userlastname }}
                                </span>
                                <input v-else v-model="editForm.userlastname" type="text" class="form-control" />
                            </td>

                            <td>
                                <span v-if="editingRowId !== profile.id">
                                    {{ profile.userphone || '-' }}
                                </span>
                                <input v-else v-model="editForm.userphone" type="text" class="form-control" />
                            </td>

                            <td>
                                <span v-if="editingRowId !== profile.id">
                                    {{ profile.usertype }}
                                </span>
                                <select v-else v-model="editForm.usertype" class="form-select">
                                    <option value="admin">admin</option>
                                    <option value="customer">customer</option>
                                </select>
                            </td>

                            <td>
                                <div v-if="editingRowId !== profile.id" class="d-flex gap-2">
                                    <button class="btn btn-sm btn-outline-primary" @click="startEdit(profile)"
                                        title="Edit">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                </div>

                                <div v-else class="d-flex gap-2">
                                    <button class="btn btn-sm btn-success" @click="saveEdit(profile.id)"
                                        :disabled="saving">
                                        Save
                                    </button>
                                    <button class="btn btn-sm btn-secondary" @click="cancelEdit" :disabled="saving">
                                        Cancel
                                    </button>
                                </div>
                            </td>
                        </tr>

                        <tr v-if="profiles.length === 0">
                            <td colspan="6" class="text-center">No profiles found.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </template>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import APIService from '@/api/APIService';
import { useAuthStore } from "@/store/AuthStore";

const auth = useAuthStore();

const profiles = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const editingRowId = ref(null);

const editForm = ref({
    userfirstname: '',
    userlastname: '',
    userphone: '',
    usertype: '',
});

const loadProfiles = async () => {
    loading.value = true;
    error.value = '';

    try {
        profiles.value = await APIService.getUserProfiles();
    } catch (err) {
        error.value = err.message || 'Failed to load profiles.';
    } finally {
        loading.value = false;
    }
};

const startEdit = (profile) => {
    editingRowId.value = profile.id;
    editForm.value = {
        userfirstname: profile.userfirstname || '',
        userlastname: profile.userlastname || '',
        userphone: profile.userphone || '',
        usertype: profile.usertype || 'user',
    };
};

const cancelEdit = () => {
    editingRowId.value = null;
    editForm.value = {
        userfirstname: '',
        userlastname: '',
        userphone: '',
        usertype: '',
    };
};

const saveEdit = async (profileId) => {
    saving.value = true;
    error.value = '';

    try {
        const updatedProfile = await APIService.updateUserProfile(profileId, {
            userfirstname: editForm.value.userfirstname,
            userlastname: editForm.value.userlastname,
            userphone: editForm.value.userphone || null,
            usertype: editForm.value.usertype,
        });

        const index = profiles.value.findIndex((p) => p.id === profileId);
        if (index !== -1) {
            profiles.value[index] = {
                ...profiles.value[index],
                ...updatedProfile,
            };
        }

        cancelEdit();
    } catch (err) {
        error.value = err.message || 'Failed to save profile changes.';
    } finally {
        saving.value = false;
    }
};

onMounted(() => {

    if (auth.isAuthenticated && auth.usertype === 'admin') {
        loadProfiles();
    } else {
        this.$router.push("/login");
    }
});
</script>