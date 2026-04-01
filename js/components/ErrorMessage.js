export function renderErrorMessage(message = 'Something went wrong.') {
    return `
    <div class="card placeholder-page">
      <h3>Error</h3>
      <p>${message}</p>
    </div>
  `;
}