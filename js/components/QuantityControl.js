export function renderQuantityControl(dishId, quantity = 0) {
    if (quantity <= 0) {
        return `
      <button class="btn btn--primary" data-action="add-to-cart" data-dish-id="${dishId}">
        Add to cart
      </button>
    `;
    }

    return `
    <div class="quantity-control">
      <button class="btn btn--secondary" data-action="decrease-quantity" data-dish-id="${dishId}">
        -
      </button>
      <span class="quantity-control__value">${quantity}</span>
      <button class="btn btn--primary" data-action="increase-quantity" data-dish-id="${dishId}">
        +
      </button>
    </div>
  `;
}