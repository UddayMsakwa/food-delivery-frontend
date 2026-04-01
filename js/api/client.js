import { CONFIG } from '../config.js';
import { getToken } from '../utils/storage.js';

async function request(path, options = {}) {
    const token = getToken();

    const headers = {
        ...(options.headers || {})
    };

    if (options.body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
        ...options,
        headers
    });

    const text = await response.text();

    if (!response.ok) {
        let errorMessage = 'Request failed';

        if (text) {
            try {
                const errorData = JSON.parse(text);
                errorMessage = errorData.message || errorData.title || errorMessage;
            } catch {
                errorMessage = text || response.statusText || errorMessage;
            }
        } else {
            errorMessage = response.statusText || errorMessage;
        }

        throw new Error(errorMessage);
    }

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

export const apiClient = {
    get(path) {
        return request(path, {
            method: 'GET'
        });
    },

    post(path, body) {
        const options = {
            method: 'POST'
        };

        if (body !== undefined) {
            options.body = JSON.stringify(body);
        }

        return request(path, options);
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