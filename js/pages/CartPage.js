import { renderNavbar, bindNavbarEvents } from '../components/Navbar.js';
import { renderFooter } from '../components/Footer.js';
import { renderLoader } from '../components/Loader.js';
import { renderErrorMessage } from '../components/ErrorMessage.js';
import { renderEmptyState } from '../components/EmptyState.js';
import { requireAuth } from '../utils/guards.js';
import { getCart, updateCartItem, removeCartItem } from '../api/cartApi.js';
import { setState, getState } from '../store.js';
import { navigateTo } from '../router.js';

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

function getItemQuantity(item) {
    return item.amount ?? item.quantity ?? 0;
}

function getItemPrice(item) {
    return item.price ?? item.totalPrice ?? 0;
}

function getLineTotal(item) {
    const quantity = getItemQuantity(item);
    const price = getItemPrice(item);

    return quantity * price;
}

function getDishId(item) {
    return item.id ?? item.dishId;
}

function renderCartItem(item) {
    const dishId = getDishId(item);
    const quantity = getItemQuantity(item);
    const price = getItemPrice(item);
    const lineTotal = getLineTotal(item);

    return `
    <article class="card cart-item">
      <div class="cart-item__info">
        <h3>${item.name || 'Dish'}</h3>
        <p>${item.description || 'No description available.'}</p>
        <p><strong>Unit price:</strong> ${price}</p>
        <p><strong>Quantity:</strong> ${quantity}</p>
        <p><strong>Total:</strong> ${lineTotal}</p>
      </div>

      <div class="cart-item__actions">
        <button class="btn btn--secondary" data-action="decrease-cart-item" data-dish-id="${dishId}">
          -
        </button>
        <button class="btn btn--primary" data-action="increase-cart-item" data-dish-id="${dishId}">
          +
        </button>
        <button class="btn btn--danger" data-action="remove-cart-item" data-dish-id="${dishId}">
          Remove
        </button>
      </div>
    </article>
  `;
}

function calculateCartTotal(items) {
    return items.reduce((sum, item) => sum + getLineTotal(item), 0);
}

async function loadCart(app) {
    if (!requireAuth()) {
        return;
    }

    app.innerHTML = `
    ${renderNavbar()}
    <main class="container page">
      ${renderLoader('Loading cart...')}
    </main>
    ${renderFooter()}
  `;

    bindNavbarEvents(app);

    try {
        const cartResponse = await getCart();
        const items = normalizeCartItems(cartResponse);

        setState({
            cart: items
        });

        renderCartContent(app, items);
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

function renderCartContent(app, items) {
    const total = calculateCartTotal(items);

    app.innerHTML = `
    ${renderNavbar()}

    <main class="container page">
      <section class="section">
        <h1 class="page-title">Cart</h1>
      </section>

      ${items.length === 0
            ? renderEmptyState('Your cart is empty', 'Add dishes from the menu to start an order.')
            : `
            <section class="section">
              <div class="cart-list">
                ${items.map(renderCartItem).join('')}
              </div>
            </section>

            <section class="card cart-summary">
              <h2>Summary</h2>
              <p><strong>Total items:</strong> ${items.length}</p>
              <p><strong>Total price:</strong> ${total}</p>

              <button id="goToPurchaseBtn" class="btn btn--primary" type="button">
                Proceed to checkout
              </button>
            </section>
          `
        }
    </main>

    ${renderFooter()}
  `;

    bindNavbarEvents(app);
    bindCartEvents(app);
}

function bindCartEvents(app) {
    const purchaseButton = document.getElementById('goToPurchaseBtn');

    if (purchaseButton) {
        purchaseButton.addEventListener('click', () => {
            navigateTo('/purchase');
        });
    }

    app.querySelectorAll('[data-action="increase-cart-item"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const dishId = button.dataset.dishId;

            try {
                await updateCartItem(dishId, true);
                await loadCart(app);
            } catch (error) {
                alert(error.message);
            }
        });
    });

    app.querySelectorAll('[data-action="decrease-cart-item"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const dishId = button.dataset.dishId;

            try {
                await updateCartItem(dishId, false);
                await loadCart(app);
            } catch (error) {
                alert(error.message);
            }
        });
    });

    app.querySelectorAll('[data-action="remove-cart-item"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const dishId = button.dataset.dishId;

            try {
                await removeCartItem(dishId);
                await loadCart(app);
            } catch (error) {
                alert(error.message);
            }
        });
    });
}

export async function renderCartPage(app) {
    const { token } = getState();

    if (!token) {
        navigateTo('/login');
        return;
    }

    await loadCart(app);
}