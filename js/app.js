import { initRouter, registerRoute, renderRoute } from './router.js';
import { renderLoginPage } from './pages/LoginPage.js';
import { renderRegistrationPage } from './pages/RegistrationPage.js';
import { renderMenuPage } from './pages/MenuPage.js';
import { renderProfilePage } from './pages/ProfilePage.js';
import { renderCartPage } from './pages/CartPage.js';
import { renderOrdersPage } from './pages/OrdersPage.js';
import { renderOrderDetailsPage } from './pages/OrderDetailsPage.js';
import { renderPurchasePage } from './pages/PurchasePage.js';

async function renderPlaceholderPage(app, title) {
    app.innerHTML = `
    <main class="container page">
      <h1>${title}</h1>
      <p>This page is under construction.</p>
    </main>
  `;
}

registerRoute((path) => path === '/', renderMenuPage);
registerRoute((path) => path === '/login', renderLoginPage);
registerRoute((path) => path === '/registration', renderRegistrationPage);
registerRoute((path) => path === '/profile', renderProfilePage);
registerRoute((path) => path === '/cart', renderCartPage);
registerRoute((path) => path === '/orders', renderOrdersPage);
registerRoute((path) => path === '/purchase', renderPurchasePage);
registerRoute((path) => path.startsWith('/order/'), renderOrderDetailsPage);

registerRoute((path) => path.startsWith('/item/'), (app) => {
    renderPlaceholderPage(app, 'Dish Details');
});

registerRoute(() => true, (app) => {
    app.innerHTML = `
    <main class="container page">
      <h1>404 - Page not found</h1>
    </main>
  `;
});

initRouter();
renderRoute();