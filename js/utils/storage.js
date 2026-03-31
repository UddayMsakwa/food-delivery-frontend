import { CONFIG } from '../config.js';

export function setToken(token) {
    localStorage.setItem(CONFIG.STORAGE_TOKEN_KEY, token);
}

export function getToken() {
    return localStorage.getItem(CONFIG.STORAGE_TOKEN_KEY);
}

export function removeToken() {
    localStorage.removeItem(CONFIG.STORAGE_TOKEN_KEY);
}

export function setUser(user) {
    localStorage.setItem(CONFIG.STORAGE_USER_KEY, JSON.stringify(user));
}

export function getUser() {
    const rawUser = localStorage.getItem(CONFIG.STORAGE_USER_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
}

export function removeUser() {
    localStorage.removeItem(CONFIG.STORAGE_USER_KEY);
}

export function clearAuthStorage() {
    removeToken();
    removeUser();
}