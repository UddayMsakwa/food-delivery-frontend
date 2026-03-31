import { apiClient } from './client.js';

export function getOrders() {
    return apiClient.get('/order');
}

export function getOrderById(id) {
    return apiClient.get(`/order/${id}`);
}

export function createOrder(payload) {
    return apiClient.post('/order', payload);
}

export function confirmDelivery(id) {
    return apiClient.post(`/order/${id}/status`, {});
}