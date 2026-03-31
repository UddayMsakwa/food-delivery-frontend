import { apiClient } from './client.js';

export function setDishRating(dishId, ratingScore) {
    return apiClient.post(`/dish/${dishId}/rating?ratingScore=${ratingScore}`, {});
}