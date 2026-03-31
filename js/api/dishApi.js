import { apiClient } from './client.js';

export function getDishes(queryString = '') {
    return apiClient.get(`/dish${queryString}`);
}

export function getDishById(id) {
    return apiClient.get(`/dish/${id}`);
}