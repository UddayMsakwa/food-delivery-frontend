import { renderNavbar, bindNavbarEvents } from '../components/Navbar.js';
import { renderFooter } from '../components/Footer.js';
import { renderLoader } from '../components/Loader.js';
import { renderErrorMessage } from '../components/ErrorMessage.js';
import { renderEmptyState } from '../components/EmptyState.js';
import { requireAuth } from '../utils/guards.js';
import { getOrders, confirmDelivery } from '../api/orderApi.js';
import { setState } from '../store.js';
import { navigateTo } from '../router.js';

function normalizeOrders(response) {
    if (!response) {
        return [];
    }

    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response.orders)) {
        return response.orders;
    }

    if (Array.isArray(response.items)) {
        return response.items;
    }

    return [];
}

function getOrderId(order) {
    return order.id ?? order.orderId;
}

function getOrderStatus(order) {
    return order.status ?? order.orderStatus ?? 'Unknown';
}

function getOrderPrice(order) {
    return order.price ?? order.totalPrice ?? 0;
}

function getOrderDate(order) {
    return order.orderTime ?? order.createdAt ?? order.deliveryTime ?? '';
}

function canConfirm(order) {
    const status = String(getOrderStatus(order)).toLowerCase();
    return status.includes('process');
}

function renderOrderCard(order) {
    const orderId = getOrderId(order);
    const status = getOrderStatus(order);
    const price = getOrderPrice(order);
    const date = getOrderDate(order);

    return `
    <article class="card order-card">
      <div class="order-card__info">
        <h3>Order #${orderId}</h3>
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>Date:</strong> ${date || 'Not specified'}</p>
        <p><strong>Total:</strong> ${price}</p>
      </div>

      <div class="order-card__actions">
        <button
          class="btn btn--secondary"
          data-action="open-order-details"
          data-order-id="${orderId}"
          type="button"
        >
          View details
        </button>

        ${canConfirm(order)
            ? `
              <button
                class="btn btn--primary"
                data-action="confirm-delivery"
                data-order-id="${orderId}"
                type="button"
              >
                Confirm delivery
              </button>
            `
            : ''
        }
      </div>
    </article>
  `;
}

async function loadOrders(app) {
    if (!requireAuth()) {
        return;
    }

    app.innerHTML = `
    ${renderNavbar()}
    <main class="container page">
      ${renderLoader('Loading orders...')}
    </main>
    ${renderFooter()}
  `;

    bindNavbarEvents(app);

    try {
        const response = await getOrders();
        const orders = normalizeOrders(response);

        setState({
            orders
        });

        renderOrdersContent(app, orders);
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

function renderOrdersContent(app, orders) {
    app.innerHTML = `
    ${renderNavbar()}

    <main class="container page">
      <section class="section">
        <h1 class="page-title">Orders</h1>
      </section>

      ${orders.length === 0
            ? renderEmptyState('No orders yet', 'Create your first order from the cart.')
            : `
            <section class="section">
              <div class="orders-list">
                ${orders.map(renderOrderCard).join('')}
              </div>
            </section>
          `
        }
    </main>

    ${renderFooter()}
  `;

    bindNavbarEvents(app);
    bindOrdersEvents(app);
}

function bindOrdersEvents(app) {
    app.querySelectorAll('[data-action="open-order-details"]').forEach((button) => {
        button.addEventListener('click', () => {
            const orderId = button.dataset.orderId;
            navigateTo(`/order/${orderId}`);
        });
    });

    app.querySelectorAll('[data-action="confirm-delivery"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const orderId = button.dataset.orderId;

            try {
                await confirmDelivery(orderId);
                await loadOrders(app);
            } catch (error) {
                alert(error.message);
            }
        });
    });
}

export async function renderOrdersPage(app) {
    await loadOrders(app);
}