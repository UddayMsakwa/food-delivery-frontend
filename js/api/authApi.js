import { apiClient } from './client.js';

export function login(payload) {
    return apiClient.post('/account/login', payload);
}

export function register(payload) {
    return apiClient.post('/account/register', payload);
}