import { renderNavbar, bindNavbarEvents } from '../components/Navbar.js';
import { renderFooter } from '../components/Footer.js';
import { login } from '../api/authApi.js';
import { loginUser } from '../store.js';
import { navigateTo } from '../router.js';
import { isRequired, isValidEmail } from '../utils/validators.js';

export async function renderLoginPage(app) {
    app.innerHTML = `
    ${renderNavbar()}

    <main class="container page">
      <section class="card auth-card">
        <h1>Authorization</h1>

        <form id="loginForm" class="form">
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" />
            <small class="error" id="emailError"></small>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" type="password" />
            <small class="error" id="passwordError"></small>
          </div>

          <small class="error" id="formError"></small>

          <button id="submitBtn" type="submit" class="btn btn--primary">
            Log in
          </button>
        </form>
      </section>
    </main>

    ${renderFooter()}
  `;

    bindNavbarEvents(app);

    const form = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        document.getElementById('emailError').textContent = '';
        document.getElementById('passwordError').textContent = '';
        document.getElementById('formError').textContent = '';

        let valid = true;

        if (!isRequired(email) || !isValidEmail(email)) {
            document.getElementById('emailError').textContent = 'Enter a valid email';
            valid = false;
        }

        if (!isRequired(password)) {
            document.getElementById('passwordError').textContent = 'Password is required';
            valid = false;
        }

        if (!valid) {
            return;
        }

        submitBtn.disabled = true;

        try {
            const result = await login({ email, password });
            loginUser(result.token);
            navigateTo('/');
        } catch (error) {
            document.getElementById('formError').textContent = error.message;
        } finally {
            submitBtn.disabled = false;
        }
    });
}