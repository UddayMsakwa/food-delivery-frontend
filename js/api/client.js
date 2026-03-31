import { CONFIG } from '../config.js';
import { getToken } from '../utils/storage.js';

async function request(path, options = {}) {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        let errorMessage = 'Request failed';

        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.title || errorMessage;
        } catch {
            errorMessage = response.statusText || errorMessage;
        }

        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export const apiClient = {
    get(path) {
        return request(path, {
            method: 'GET'
        });
    },

    post(path, body) {
        return request(path, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    put(path, body) {
        return request(path, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    delete(path) {
        return request(path, {
            method: 'DELETE'
        });
    }
};