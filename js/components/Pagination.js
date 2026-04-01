import { buildMenuQuery } from '../utils/query.js';

export function renderPagination(currentPage = 1, totalPages = 1, menuState) {
    if (!totalPages || totalPages <= 1) {
        return '';
    }

    let items = '';

    for (let page = 1; page <= totalPages; page += 1) {
        const query = buildMenuQuery({
            ...menuState,
            page
        });

        items += `
      <a
        href="/${query}"
        data-link
        class="pagination__link ${page === currentPage ? 'pagination__link--active' : ''}"
      >
        ${page}
      </a>
    `;
    }

    return `
    <nav class="pagination">
      ${items}
    </nav>
  `;
}