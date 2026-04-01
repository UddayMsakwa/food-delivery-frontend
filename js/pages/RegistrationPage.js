import { renderNavbar, bindNavbarEvents } from '../components/Navbar.js';
import { renderFooter } from '../components/Footer.js';
import { register } from '../api/authApi.js';
import { loginUser } from '../store.js';
import { navigateTo } from '../router.js';
import { isRequired, isValidEmail, isValidPhone } from '../utils/validators.js';
import { applyPhoneMask } from '../utils/phoneMask.js';

export async function renderRegistrationPage(app) {
    app.innerHTML = `
    ${renderNavbar()}

    <main class="container page">
      <section class="card auth-card">
        <h1>Registration</h1>

        <form id="registrationForm" class="form">
          <div class="form-group">
            <label for="fullName">Full name</label>
            <input id="fullName" type="text" />
            <small class="error" id="fullNameError"></small>
          </div>

          <div class="form-group">
            <label for="birthDate">Birth date</label>
            <input id="birthDate" type="date" />
            <small class="error" id="birthDateError"></small>
          </div>

          <div class="form-group">
            <label for="gender">Gender</label>
            <select id="gender">
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <small class="error" id="genderError"></small>
          </div>

          <div class="form-group">
            <label for="address">Address</label>
            <input id="address" type="text" />
            <small class="error" id="addressError"></small>
          </div>

          <div class="form-group">
            <label for="phone">Phone</label>
            <input id="phone" type="text" />
            <small class="error" id="phoneError"></small>
          </div>

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
            Register
          </button>
        </form>
      </section>
    </main>

    ${renderFooter()}
  `;

    bindNavbarEvents(app);

    const phoneInput = document.getElementById('phone');
    applyPhoneMask(phoneInput);

    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const fullName = document.getElementById('fullName').value.trim();
        const birthDate = document.getElementById('birthDate').value;
        const gender = document.getElementById('gender').value;
        const address = document.getElementById('address').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        const errorIds = [
            'fullNameError',
            'birthDateError',
            'genderError',
            'addressError',
            'phoneError',
            'emailError',
            'passwordError',
            'formError'
        ];

        errorIds.forEach((id) => {
            document.getElementById(id).textContent = '';
        });

        let valid = true;

        if (!isRequired(fullName)) {
            document.getElementById('fullNameError').textContent = 'Full name is required';
            valid = false;
        }

        if (!isRequired(birthDate)) {
            document.getElementById('birthDateError').textContent = 'Birth date is required';
            valid = false;
        }

        if (!isRequired(gender)) {
            document.getElementById('genderError').textContent = 'Gender is required';
            valid = false;
        }

        if (!isRequired(address)) {
            document.getElementById('addressError').textContent = 'Address is required';
            valid = false;
        }

        if (!isRequired(phone) || !isValidPhone(phone)) {
            document.getElementById('phoneError').textContent = 'Enter phone in format +7 (xxx) xxx-xx-xx-xx';
            valid = false;
        }

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
            const result = await register({
                fullName,
                birthDate,
                gender,
                address,
                phoneNumber: phone,
                email,
                password
            });

            loginUser(result.token);
            navigateTo('/');
        } catch (error) {
            document.getElementById('formError').textContent = error.message;
        } finally {
            submitBtn.disabled = false;
        }
    });
}