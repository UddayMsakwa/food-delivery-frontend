import { renderNavbar, bindNavbarEvents } from '../components/Navbar.js';
import { renderFooter } from '../components/Footer.js';
import { renderLoader } from '../components/Loader.js';
import { renderErrorMessage } from '../components/ErrorMessage.js';
import { renderEmptyState } from '../components/EmptyState.js';
import { requireAuth } from '../utils/guards.js';
import { getCart } from '../api/cartApi.js';
import { createOrder } from '../api/orderApi.js';
import { getProfile } from '../api/profileApi.js';
import { getState, setState } from '../store.js';
import { isRequired } from '../utils/validators.js';
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
    return getItemQuantity(item) * getItemPrice(item);
}

function calculateTotal(items) {
    return items.reduce((sum, item) => sum + getLineTotal(item), 0);
}

function renderPurchaseItem(item) {
    return `
    <article class="card order-detail-item">
      <h3>${item.name || 'Dish'}</h3>
      <p><strong>Quantity:</strong> ${getItemQuantity(item)}</p>
      <p><strong>Unit price:</strong> ${getItemPrice(item)}</p>
      <p><strong>Total:</strong> ${getLineTotal(item)}</p>
    </article>
  `;
}

function pad(value) {
    return String(value).padStart(2, '0');
}

function toLocalDateTimeInputValue(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getMinimumDeliveryDate() {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 61);
    date.setSeconds(0, 0);
    return date;
}

function getDefaultDeliveryDate() {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 90);
    date.setSeconds(0, 0);
    return date;
}

function isDeliveryTimeValid(deliveryTimeValue) {
    if (!deliveryTimeValue) {
        return false;
    }

    const selected = new Date(deliveryTimeValue);
    const minimum = getMinimumDeliveryDate();

    return selected.getTime() > minimum.getTime();
}

function renderPurchaseContent(app, items) {
    const { user } = getState();
    const total = calculateTotal(items);
    const minimumDeliveryValue = toLocalDateTimeInputValue(getMinimumDeliveryDate());
    const defaultDeliveryValue = toLocalDateTimeInputValue(getDefaultDeliveryDate());

    app.innerHTML = `
    ${renderNavbar()}

    <main class="container page">
      <section class="section">
        <div style="display:flex; gap:0.75rem; align-items:center; justify-content:space-between; flex-wrap:wrap;">
          <h1 class="page-title">Create order</h1>
          <button id="backToCartBtn" class="btn btn--secondary" type="button">
            Back to cart
          </button>
        </div>
      </section>

      ${items.length === 0
            ? renderEmptyState('Cart is empty', 'Add dishes to your cart before checkout.')
            : `
            <section class="card section">
              <h2>User data</h2>
              <p><strong>Email:</strong> ${user?.email || 'Not available'}</p>
              <p><strong>Phone:</strong> ${user?.phoneNumber || 'Not available'}</p>
            </section>

            <section class="card section">
              <h2>Delivery data</h2>

              <form id="purchaseForm" class="form">
                <div class="form-group">
                  <label for="address">Delivery address</label>
                  <input id="address" type="text" value="${user?.address || ''}" />
                  <small class="error" id="addressError"></small>
                </div>

                <div class="form-group">
                  <label for="deliveryTime">Delivery time</label>
                  <input
                    id="deliveryTime"
                    type="datetime-local"
                    min="${minimumDeliveryValue}"
                    value="${defaultDeliveryValue}"
                  />
                  <small class="error" id="deliveryTimeError"></small>
                </div>

                <small class="error" id="purchaseError"></small>

                <button id="confirmOrderBtn" type="submit" class="btn btn--primary">
                  Confirm order
                </button>
              </form>
            </section>

            <section class="section">
              <h2>Items</h2>
              <div class="orders-list">
                ${items.map(renderPurchaseItem).join('')}
              </div>
            </section>

            <section class="card cart-summary">
              <h2>Summary</h2>
              <p><strong>Total items:</strong> ${items.length}</p>
              <p><strong>Total price:</strong> ${total}</p>
            </section>
          `
        }
    </main>

    ${renderFooter()}
  `;

    bindNavbarEvents(app);

    const backToCartBtn = document.getElementById('backToCartBtn');
    if (backToCartBtn) {
        backToCartBtn.addEventListener('click', () => {
            navigateTo('/cart');
        });
    }

    const form = document.getElementById('purchaseForm');

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const address = document.getElementById('address').value.trim();
            const deliveryTime = document.getElementById('deliveryTime').value;
            const submitBtn = document.getElementById('confirmOrderBtn');
            const purchaseError = document.getElementById('purchaseError');

            document.getElementById('addressError').textContent = '';
            document.getElementById('deliveryTimeError').textContent = '';
            purchaseError.textContent = '';

            let valid = true;

            if (!isRequired(address)) {
                document.getElementById('addressError').textContent = 'Address is required';
                valid = false;
            }

            if (!isRequired(deliveryTime)) {
                document.getElementById('deliveryTimeError').textContent = 'Delivery time is required';
                valid = false;
            } else if (!isDeliveryTimeValid(deliveryTime)) {
                document.getElementById('deliveryTimeError').textContent = 'Delivery time must be more than 60 minutes from now';
                valid = false;
            }

            if (!valid) {
                return;
            }

            submitBtn.disabled = true;

            try {
                const order = await createOrder({
                    address,
                    deliveryTime: `${deliveryTime}:00`
                });

                setState({
                    cart: []
                });

                const orderId = order?.id ?? order?.orderId;

                if (orderId) {
                    navigateTo(`/order/${orderId}`);
                } else {
                    navigateTo('/orders');
                }
            } catch (error) {
                purchaseError.textContent = error.message;
            } finally {
                submitBtn.disabled = false;
            }
        });
    }
}

export async function renderPurchasePage(app) {
    if (!requireAuth()) {
        return;
    }

    app.innerHTML = `
    ${renderNavbar()}
    <main class="container page">
      ${renderLoader('Loading checkout...')}
    </main>
    ${renderFooter()}
  `;

    bindNavbarEvents(app);

    try {
        const [cartResponse, profile] = await Promise.all([
            getCart(),
            getProfile()
        ]);

        const items = normalizeCartItems(cartResponse);

        setState({
            cart: items,
            user: profile
        });

        renderPurchaseContent(app, items);
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