import { renderQuantityControl } from './QuantityControl.js';

export function renderDishCard(dish, cartItem = null) {
    const quantity = cartItem?.amount || 0;
    const isVegetarian = dish.vegetarian === true;

    return `
    <article class="card dish-card">
      <a href="/item/${dish.id}" data-link class="dish-card__image-link">
        <img
          src="${dish.image || 'https://via.placeholder.com/400x250?text=Dish'}"
          alt="${dish.name}"
          class="dish-card__image"
        />
      </a>

      <div class="dish-card__body">
        <div class="dish-card__top">
          <h3 class="dish-card__title">
            <a href="/item/${dish.id}" data-link>${dish.name}</a>
          </h3>
          ${isVegetarian ? '<span class="dish-card__badge">Vegetarian</span>' : ''}
        </div>

        <p class="dish-card__description">${dish.description || 'No description available.'}</p>

        <div class="dish-card__meta">
          <span><strong>Price:</strong> ${dish.price ?? 0}</span>
          <span><strong>Rating:</strong> ${dish.rating ?? 0}</span>
        </div>

        <div class="dish-card__actions">
          ${renderQuantityControl(dish.id, quantity)}
        </div>
      </div>
    </article>
  `;
}