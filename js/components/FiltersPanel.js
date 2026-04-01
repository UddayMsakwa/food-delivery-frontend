import { DISH_CATEGORIES, DISH_SORTING } from '../constants.js';

export function renderFiltersPanel(menuState) {
    const selectedCategories = menuState.categories || [];
    const vegetarian = menuState.vegetarian === true;
    const sorting = menuState.sorting || '';

    const sortOptions = [
        { value: '', label: 'No sorting' },
        { value: DISH_SORTING.NAME_ASC, label: 'Name A-Z' },
        { value: DISH_SORTING.NAME_DESC, label: 'Name Z-A' },
        { value: DISH_SORTING.PRICE_ASC, label: 'Price ascending' },
        { value: DISH_SORTING.PRICE_DESC, label: 'Price descending' },
        { value: DISH_SORTING.RATING_ASC, label: 'Rating ascending' },
        { value: DISH_SORTING.RATING_DESC, label: 'Rating descending' }
    ];

    return `
    <section class="card filters-panel">
      <h2>Filters</h2>

      <div class="filters-panel__group">
        <p><strong>Categories</strong></p>
        <div class="filters-panel__categories">
          ${DISH_CATEGORIES.map((category) => `
            <label class="filters-panel__checkbox">
              <input
                type="checkbox"
                name="categories"
                value="${category}"
                ${selectedCategories.includes(category) ? 'checked' : ''}
              />
              <span>${category}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <div class="filters-panel__group">
        <label class="filters-panel__checkbox">
          <input type="checkbox" id="vegetarianOnly" ${vegetarian ? 'checked' : ''} />
          <span>Vegetarian only</span>
        </label>
      </div>

      <div class="filters-panel__group">
        <label for="sortingSelect"><strong>Sorting</strong></label>
        <select id="sortingSelect">
          ${sortOptions.map((option) => `
            <option value="${option.value}" ${sorting === option.value ? 'selected' : ''}>
              ${option.label}
            </option>
          `).join('')}
        </select>
      </div>

      <div class="filters-panel__actions">
        <button class="btn btn--primary" id="applyFiltersBtn" type="button">Apply filters</button>
        <button class="btn btn--secondary" id="resetFiltersBtn" type="button">Reset</button>
      </div>
    </section>
  `;
}