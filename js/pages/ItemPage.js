import { renderNavbar, bindNavbarEvents } from '../components/Navbar.js';
import { renderFooter } from '../components/Footer.js';
import { renderLoader } from '../components/Loader.js';
import { renderErrorMessage } from '../components/ErrorMessage.js';
import { renderQuantityControl } from '../components/QuantityControl.js';
import { renderStarRating } from '../components/StarRating.js';

import { getDishById } from '../api/dishApi.js';
import { getCart, addToCart, updateCartItem } from '../api/cartApi.js';
import { setDishRating } from '../api/ratingApi.js';

import { getState, setState } from '../store.js';
import { navigateTo } from '../router.js';

function extractDishIdFromPath() {
    const parts = window.location.pathname.split('/');
    return parts[2];
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

function getCartItemByDishId(cart, dishId) {
    return cart.find((item) => item.id === dishId || item.dishId === dishId) || null;
}

function canUserRateDish(dish) {
    return Boolean(
        dish?.canRate ||
        dish?.canUserRate ||
        dish?.userCanRate ||
        dish?.isAbleToRate ||
        dish?.isAllowedToRate ||
        dish?.canSetRating ||
        dish?.canPutRating
    );
}

function renderItemContent(app, dish) {
    const state = getState();
    const cart = state.cart || [];
    const cartItem = getCartItemByDishId(cart, dish.id);
    const quantity = cartItem?.amount || cartItem?.quantity || 0;
    const explicitPermission = canUserRateDish(dish);
    const isVegetarian = dish.vegetarian === true;

    app.innerHTML = `
    ${renderNavbar()}

    <main class="container page">
      <section class="section">
        <div style="display:flex; gap:0.75rem; align-items:center; justify-content:space-between; flex-wrap:wrap;">
          <h1 class="page-title">${dish.name || 'Dish details'}</h1>
          <button id="backToMenuBtn" class="btn btn--secondary" type="button">
            Back to menu
          </button>
        </div>
      </section>

      <section class="card section">
        <div class="dish-details-layout">
          <div class="dish-details__image-block">
            <img
              src="${dish.image || 'https://via.placeholder.com/600x350?text=Dish'}"
              alt="${dish.name || 'Dish'}"
              class="dish-details__image"
            />
          </div>

          <div class="dish-details__content">
            <p><strong>Category:</strong> ${dish.category || dish.categoryName || 'Not specified'}</p>
            <p><strong>Vegetarian:</strong> ${isVegetarian ? 'Yes' : 'No'}</p>
            <p><strong>Price:</strong> ${dish.price ?? 0}</p>
            <p><strong>Description:</strong> ${dish.description || 'No description available.'}</p>

            <div class="dish-details__rating-block">
              <h3>Rating</h3>
              ${renderStarRating(dish.rating ?? 0, true)}
              <small id="ratingHelpText">
                ${explicitPermission
            ? 'You can rate this dish.'
            : 'Click a star to try rating. If the dish was not previously ordered, the server may reject it.'
        }
              </small>
              <small class="error" id="ratingError"></small>
            </div>

            <div class="dish-details__cart-block">
              <h3>Cart</h3>
              ${renderQuantityControl(dish.id, quantity)}
            </div>
          </div>
        </div>
      </section>
    </main>

    ${renderFooter()}
  `;

    bindNavbarEvents(app);
    bindItemEvents(app, dish);
}

async function loadDish(app) {
    const dishId = extractDishIdFromPath();

    app.innerHTML = `
    ${renderNavbar()}
    <main class="container page">
      ${renderLoader('Loading dish details...')}
    </main>
    ${renderFooter()}
  `;

    bindNavbarEvents(app);

    try {
        const state = getState();

        const requests = [getDishById(dishId)];

        if (state.token) {
            requests.push(getCart());
        }

        const results = await Promise.all(requests);
        const dish = results[0];
        const cartResponse = results[1];

        if (cartResponse) {
            setState({
                cart: normalizeCartItems(cartResponse)
            });
        }

        setState({
            currentDish: dish
        });

        renderItemContent(app, dish);
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

function bindItemEvents(app, dish) {
    const backToMenuBtn = document.getElementById('backToMenuBtn');

    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
            navigateTo('/');
        });
    }

    const addButton = app.querySelector('[data-action="add-to-cart"]');
    if (addButton) {
        addButton.addEventListener('click', async () => {
            const { token } = getState();

            if (!token) {
                navigateTo('/login');
                return;
            }

            try {
                await addToCart(dish.id);
                await loadDish(app);
            } catch (error) {
                alert(error.message);
            }
        });
    }

    app.querySelectorAll('[data-action="increase-quantity"]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                await updateCartItem(dish.id, true);
                await loadDish(app);
            } catch (error) {
                alert(error.message);
            }
        });
    });

    app.querySelectorAll('[data-action="decrease-quantity"]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                await updateCartItem(dish.id, false);
                await loadDish(app);
            } catch (error) {
                alert(error.message);
            }
        });
    });

    app.querySelectorAll('[data-action="rate-dish"]').forEach((star) => {
        star.addEventListener('click', async () => {
            const { token } = getState();

            if (!token) {
                navigateTo('/login');
                return;
            }

            const ratingError = document.getElementById('ratingError');
            if (ratingError) {
                ratingError.textContent = '';
            }

            const ratingValue = Number(star.dataset.ratingValue);

            try {
                await setDishRating(dish.id, ratingValue);
                await loadDish(app);
            } catch (error) {
                if (ratingError) {
                    ratingError.textContent = error.message;
                }
            }
        });
    });
}

export async function renderItemPage(app) {
    await loadDish(app);
}