export function renderEmptyState(title = 'Nothing found', message = 'No data available.') {
    return `
    <div class="card placeholder-page">
      <h3>${title}</h3>
      <p>${message}</p>
    </div>
  `;
}