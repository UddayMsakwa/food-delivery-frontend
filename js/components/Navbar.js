import { getState, logoutUser } from '../store.js';
import { navigateTo } from '../router.js';

export function renderNavbar() {
    const { token, user, cart } = getState();

    const cartCount = Array.isArray(cart) ? cart.length : 0;

    return `
    <header class="navbar">
      <div class="container navbar__inner">
        <a href="/" data-link class="navbar__brand">
          Delivery.Eats
        </a>

        <nav class="navbar__nav">
          <a href="/" data-link>Menu</a>
          <a href="/orders" data-link>Orders</a>
          <a href="/cart" data-link>
            Cart
            <span class="cart-badge">${cartCount}</span>
          </a>
        </nav>

        <div class="navbar__user">
          ${token
            ? `
                <a href="/profile" data-link>
                  ${user?.email || 'Profile'}
                </a>
                <button id="logoutBtn" class="btn btn--secondary">
                  Logout
                </button>
              `
            : `
                <a href="/login" data-link>Login</a>
                <a href="/registration" data-link>Register</a>
              `
        }
        </div>
      </div>
    </header>
  `;
}

export function bindNavbarEvents(container) {
    const logoutBtn = container.querySelector('#logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logoutUser();
            navigateTo('/login');
        });
    }
}