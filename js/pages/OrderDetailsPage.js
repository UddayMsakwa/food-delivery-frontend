import { renderNavbar, bindNavbarEvents } from '../components/Navbar.js';
import { renderFooter } from '../components/Footer.js';
import { renderLoader } from '../components/Loader.js';
import { renderErrorMessage } from '../components/ErrorMessage.js';
import { renderEmptyState } from '../components/EmptyState.js';
import { requireAuth } from '../utils/guards.js';
import { getOrderById, confirmDelivery } from '../api/orderApi.js';
import { setState } from '../store.js';
import { navigateTo } from '../router.js';

function extractOrderIdFromPath() {
    const parts = window.location.pathname.split('/');
    return parts[2];
}

function normalizeOrderItems(order) {
    if (!order) {
        return [];
    }

    if (Array.isArray(order.dishes)) {
        return order.dishes;
    }

    if (Array.isArray(order.items)) {
        return order.items;
    }

    return [];
}

function getOrderStatus(order) {
    return order.status ?? order.orderStatus ?? 'Unknown';
}

function canConfirm(order) {
    const status = String(getOrderStatus(order)).toLowerCase();
    return status.includes('process');
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

function renderOrderItem(item) {
    return `
    <article class="card order-detail-item">
      <h3>${item.name || 'Dish'}</h3>
      <p><strong>Quantity:</strong> ${getItemQuantity(item)}</p>
      <p><strong>Unit price:</strong> ${getItemPrice(item)}</p>
      <p><strong>Total:</strong> ${getLineTotal(item)}</p>
    </article>
  `;
}

function renderOrderDetailsContent(app, order) {
    const orderId = order.id ?? order.orderId ?? extractOrderIdFromPath();
    const items = normalizeOrderItems(order);

    app.innerHTML = `
    ${renderNavbar()}

    <main class="container page">
      <section class="section">
        <div style="display:flex; gap:0.75rem; align-items:center; justify-content:space-between; flex-wrap:wrap;">
          <h1 class="page-title">Order #${orderId}</h1>
          <button id="backToOrdersBtn" class="btn btn--secondary" type="button">
            Back to orders
          </button>
        </div>
      </section>

      <section class="card section">
        <p><strong>Status:</strong> ${getOrderStatus(order)}</p>
        <p><strong>Created:</strong> ${order.orderTime || order.createdAt || 'Not specified'}</p>
        <p><strong>Delivery time:</strong> ${order.deliveryTime || 'Not specified'}</p>
        <p><strong>Address:</strong> ${order.address || order.deliveryAddress || 'Not specified'}</p>
        <p><strong>Total price:</strong> ${order.price ?? order.totalPrice ?? 0}</p>

        ${canConfirm(order)
            ? `
              <button
                id="confirmDeliveryBtn"
                class="btn btn--primary"
                type="button"
                data-order-id="${orderId}"
              >
                Confirm delivery
              </button>
            `
            : ''
        }
      </section>

      <section class="section">
        <h2>Items</h2>
        ${items.length === 0
            ? renderEmptyState('No items found', 'This order has no item details available.')
            : `<div class="orders-list">${items.map(renderOrderItem).join('')}</div>`
        }
      </section>
    </main>

    ${renderFooter()}
  `;

    bindNavbarEvents(app);

    const backButton = document.getElementById('backToOrdersBtn');
    if (backButton) {
        backButton.addEventListener('click', () => {
            navigateTo('/orders');
        });
    }

    const confirmButton = document.getElementById('confirmDeliveryBtn');
    if (confirmButton) {
        confirmButton.addEventListener('click', async () => {
            try {
                await confirmDelivery(confirmButton.dataset.orderId);
                await renderOrderDetailsPage(app);
            } catch (error) {
                alert(error.message);
            }
        });
    }
}

export async function renderOrderDetailsPage(app) {
    if (!requireAuth()) {
        return;
    }

    const orderId = extractOrderIdFromPath();

    app.innerHTML = `
    ${renderNavbar()}
    <main class="container page">
      ${renderLoader('Loading order details...')}
    </main>
    ${renderFooter()}
  `;

    bindNavbarEvents(app);

    try {
        const order = await getOrderById(orderId);

        setState({
            currentOrder: order
        });

        renderOrderDetailsContent(app, order);
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