import {
    getToken,
    getUser,
    setToken,
    setUser,
    clearAuthStorage
} from './utils/storage.js';

const state = {
    token: getToken(),
    user: getUser(),
    cart: [],
    orders: [],
    currentOrder: null,
    currentDish: null,
    loading: false,
    error: null,
    menu: {
        dishes: [],
        categories: [],
        vegetarian: false,
        sorting: '',
        page: 1,
        pagination: null
    }
};

const listeners = [];

export function getState() {
    return state;
}

export function setState(partialState) {
    Object.assign(state, partialState);
    listeners.forEach((listener) => listener(state));
}

export function updateMenuState(partialMenuState) {
    state.menu = {
        ...state.menu,
        ...partialMenuState
    };

    listeners.forEach((listener) => listener(state));
}

export function subscribe(listener) {
    listeners.push(listener);

    return () => {
        const index = listeners.indexOf(listener);

        if (index >= 0) {
            listeners.splice(index, 1);
        }
    };
}

export function loginUser(token, user = null) {
    setToken(token);

    if (user) {
        setUser(user);
    }

    state.token = token;
    state.user = user;

    listeners.forEach((listener) => listener(state));
}

export function logoutUser() {
    clearAuthStorage();

    state.token = null;
    state.user = null;
    state.cart = [];
    state.orders = [];

    listeners.forEach((listener) => listener(state));
}