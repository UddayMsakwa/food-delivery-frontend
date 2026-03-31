const routes = [];

export function registerRoute(test, pageRenderer) {
    routes.push({
        test,
        pageRenderer
    });
}

export function navigateTo(path) {
    window.history.pushState({}, '', path);
    renderRoute();
}

export function replaceTo(path) {
    window.history.replaceState({}, '', path);
    renderRoute();
}

export async function renderRoute() {
    const app = document.getElementById('app');
    const currentPath = window.location.pathname;

    for (const route of routes) {
        const match = route.test(currentPath);

        if (match) {
            await route.pageRenderer(app, match);
            return;
        }
    }

    app.innerHTML = `
    <main class="container page">
      <h1>404 - Page not found</h1>
    </main>
  `;
}

export function initRouter() {
    window.addEventListener('popstate', renderRoute);

    document.addEventListener('click', (event) => {
        const link = event.target.closest('[data-link]');

        if (!link) {
            return;
        }

        event.preventDefault();

        const href = link.getAttribute('href');
        navigateTo(href);
    });
}