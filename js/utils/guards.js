import { getState } from '../store.js';
import { navigateTo } from '../router.js';
import { ROUTES } from '../constants.js';

export function requireAuth() {
    const { token } = getState();

    if (!token) {
        navigateTo(ROUTES.LOGIN);
        return false;
    }

    return true;
}