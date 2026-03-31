import { apiClient } from './client.js';

export function getProfile() {
    return apiClient.get('/account/profile');
}

export function updateProfile(payload) {
    return apiClient.put('/account/profile', payload);
}