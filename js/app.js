import { initRouter, registerRoute, renderRoute } from './router.js';
import { renderLoginPage } from './pages/LoginPage.js';
import { renderRegistrationPage } from './pages/RegistrationPage.js';
import { renderMenuPage } from './pages/MenuPage.js';
import { renderProfilePage } from './pages/ProfilePage.js';
import { renderCartPage } from './pages/CartPage.js';

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

registerRoute((path) => path === '/orders', (app) => {
    renderPlaceholderPage(app, 'Orders');
});

registerRoute((path) => path === '/purchase', (app) => {
    renderPlaceholderPage(app, 'Purchase');
});

registerRoute((path) => path.startsWith('/order/'), (app) => {
    renderPlaceholderPage(app, 'Order Details');
});

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