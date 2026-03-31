import { apiClient } from './client.js';

export function getCart() {
    return apiClient.get('/basket');
}

export function addToCart(dishId) {
    return apiClient.post(`/basket/dish/${dishId}`, {});
}

export function updateCartItem(dishId, increase = true) {
    return apiClient.post(`/basket/dish/${dishId}?increase=${increase}`, {});
}

export function removeCartItem(dishId) {
    return apiClient.delete(`/basket/dish/${dishId}`);
}