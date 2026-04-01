import { renderNavbar, bindNavbarEvents } from '../components/Navbar.js';
import { renderFooter } from '../components/Footer.js';
import { renderLoader } from '../components/Loader.js';
import { renderErrorMessage } from '../components/ErrorMessage.js';
import { renderEmptyState } from '../components/EmptyState.js';
import { renderDishCard } from '../components/DishCard.js';
import { renderPagination } from '../components/Pagination.js';
import { renderFiltersPanel } from '../components/FiltersPanel.js';

import { getDishes } from '../api/dishApi.js';
import { getCart, addToCart, updateCartItem } from '../api/cartApi.js';

import { getState, setState, updateMenuState } from '../store.js';
import { getMenuStateFromQuery, buildMenuQuery } from '../utils/query.js';
import { navigateTo } from '../router.js';

function getCartItemByDishId(cart, dishId) {
    return cart.find((item) => item.id === dishId || item.dishId === dishId) || null;
}

function normalizeCartItems(cartResponse) {
    if (!cartResponse) {
        return [];
    }

    if (Array.isArray(cartResponse)) {
        return cartResponse;
    }

    if (Array.isArray(cartResponse.dishes)) {
        return cartResponse.dishes;
    }

    if (Array.isArray(cartResponse.items)) {
        return cartResponse.items;
    }

    return [];
}

function normalizeDishResponse(response) {
    if (Array.isArray(response)) {
        return {
            dishes: response,
            pagination: {
                current: 1,
                count: 1
            }
        };
    }

    return {
        dishes: response.dishes || [],
        pagination: response.pagination || {
            current: response.page || 1,
            count: response.pages || 1
        }
    };
}

function renderMenuContent(app, data) {
    const state = getState();
    const menuState = state.menu;
    const cart = state.cart || [];

    const dishCards = data.dishes.map((dish) => {
        const cartItem = getCartItemByDishId(cart, dish.id);
        return renderDishCard(dish, cartItem);
    }).join('');

    app.innerHTML = `
    ${renderNavbar()}

    <main class="container page">
      <section class="section">
        <h1 class="page-title">Menu</h1>
      </section>

      <section class="grid grid--2 section menu-layout">
        ${renderFiltersPanel(menuState)}

        <div class="menu-content">
          ${data.dishes.length === 0
            ? renderEmptyState('No dishes found', 'Try changing your filters or pagination.')
            : `
                <div class="dish-list">
                  ${dishCards}
                </div>

                ${renderPagination(
                data.pagination.current || menuState.page || 1,
                data.pagination.count || 1,
                menuState
            )}
              `
        }
        </div>
      </section>
    </main>

    ${renderFooter()}
  `;

    bindNavbarEvents(app);
    bindMenuEvents(app);
}

async function loadMenu(app) {
    const queryState = getMenuStateFromQuery();
    updateMenuState(queryState);

    app.innerHTML = `
    ${renderNavbar()}
    <main class="container page">
      ${renderLoader('Loading menu...')}
    </main>
    ${renderFooter()}
  `;

    bindNavbarEvents(app);

    try {
        const state = getState();

        if (state.token) {
            const cartResponse = await getCart();
            setState({
                cart: normalizeCartItems(cartResponse)
            });
        }

        const queryString = buildMenuQuery({
            ...getState().menu,
            ...queryState
        });

        const response = await getDishes(queryString);
        const normalized = normalizeDishResponse(response);

        updateMenuState({
            dishes: normalized.dishes,
            pagination: normalized.pagination,
            page: normalized.pagination.current || queryState.page || 1
        });

        renderMenuContent(app, normalized);
    } catch (error) {
        app.innerHTML = `
      ${renderNavbar()}
      <main class="container page">
        ${renderErrorMessage(error.message)}
      </main>
      ${renderFooter()}
    `;
        bindNavbarEvents(app);
    }
}

function bindMenuEvents(app) {
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const sortingSelect = document.getElementById('sortingSelect');
    const vegetarianOnly = document.getElementById('vegetarianOnly');

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            const categoryInputs = [...document.querySelectorAll('input[name="categories"]:checked')];
            const categories = categoryInputs.map((input) => input.value);

            const newQuery = buildMenuQuery({
                page: 1,
                categories,
                vegetarian: vegetarianOnly?.checked || false,
                sorting: sortingSelect?.value || ''
            });

            navigateTo(`/${newQuery}`);
        });
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            navigateTo('/');
        });
    }

    app.querySelectorAll('[data-action="add-to-cart"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const { token } = getState();

            if (!token) {
                navigateTo('/login');
                return;
            }

            const dishId = button.dataset.dishId;

            try {
                await addToCart(dishId);
                await loadMenu(app);
            } catch (error) {
                alert(error.message);
            }
        });
    });

    app.querySelectorAll('[data-action="increase-quantity"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const dishId = button.dataset.dishId;

            try {
                await updateCartItem(dishId, true);
                await loadMenu(app);
            } catch (error) {
                alert(error.message);
            }
        });
    });

    app.querySelectorAll('[data-action="decrease-quantity"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const dishId = button.dataset.dishId;

            try {
                await updateCartItem(dishId, false);
                await loadMenu(app);
            } catch (error) {
                alert(error.message);
            }
        });
    });
}

export async function renderMenuPage(app) {
    await loadMenu(app);
}