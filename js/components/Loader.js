export function renderLoader(message = 'Loading...') {
    return `
    <div class="card placeholder-page">
      <p>${message}</p>
    </div>
  `;
}