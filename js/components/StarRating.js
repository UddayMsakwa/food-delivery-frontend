export function renderStarRating(rating = 0, interactive = false) {
    const safeRating = Number(rating || 0);
    let stars = '';

    for (let i = 1; i <= 5; i += 1) {
        const active = safeRating >= i ? 'star-rating__star--active' : '';
        const interactiveAttrs = interactive
            ? `data-action="rate-dish" data-rating-value="${i}" role="button" tabindex="0"`
            : '';

        stars += `
      <span class="star-rating__star ${active}" ${interactiveAttrs}>
        &#9733;
      </span>
    `;
    }

    return `
    <div class="star-rating">
      ${stars}
      <span class="star-rating__value">${safeRating.toFixed(1)}</span>
    </div>
  `;
}