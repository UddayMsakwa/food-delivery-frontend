import { renderNavbar, bindNavbarEvents } from '../components/Navbar.js';
import { renderFooter } from '../components/Footer.js';
import { renderLoader } from '../components/Loader.js';
import { renderErrorMessage } from '../components/ErrorMessage.js';
import { requireAuth } from '../utils/guards.js';
import { getProfile, updateProfile } from '../api/profileApi.js';
import { setState } from '../store.js';
import { isRequired, isValidPhone } from '../utils/validators.js';
import { applyPhoneMask } from '../utils/phoneMask.js';

export async function renderProfilePage(app) {
    if (!requireAuth()) {
        return;
    }

    app.innerHTML = `
    ${renderNavbar()}
    <main class="container page">
      ${renderLoader('Loading profile...')}
    </main>
    ${renderFooter()}
  `;

    bindNavbarEvents(app);

    try {
        const profile = await getProfile();

        setState({
            user: profile
        });

        app.innerHTML = `
      ${renderNavbar()}

      <main class="container page">
        <section class="card auth-card">
          <h1>Profile</h1>

          <form id="profileForm" class="form">
            <div class="form-group">
              <label for="fullName">Name</label>
              <input id="fullName" type="text" value="${profile.fullName || ''}" />
              <small class="error" id="fullNameError"></small>
            </div>

            <div class="form-group">
              <label for="birthDate">Birth date</label>
              <input id="birthDate" type="date" value="${profile.birthDate ? String(profile.birthDate).slice(0, 10) : ''}" />
              <small class="error" id="birthDateError"></small>
            </div>

            <div class="form-group">
              <label for="address">Address</label>
              <input id="address" type="text" value="${profile.address || ''}" />
              <small class="error" id="addressError"></small>
            </div>

            <div class="form-group">
              <label for="phone">Phone</label>
              <input id="phone" type="text" value="${profile.phoneNumber || ''}" />
              <small class="error" id="phoneError"></small>
            </div>

            <small class="error" id="formError"></small>

            <button id="saveProfileBtn" type="submit" class="btn btn--primary">
              Save changes
            </button>
          </form>
        </section>
      </main>

      ${renderFooter()}
    `;

        bindNavbarEvents(app);

        const phoneInput = document.getElementById('phone');
        applyPhoneMask(phoneInput);

        const form = document.getElementById('profileForm');
        const saveButton = document.getElementById('saveProfileBtn');

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const fullName = document.getElementById('fullName').value.trim();
            const birthDate = document.getElementById('birthDate').value;
            const address = document.getElementById('address').value.trim();
            const phoneNumber = document.getElementById('phone').value.trim();

            document.getElementById('fullNameError').textContent = '';
            document.getElementById('birthDateError').textContent = '';
            document.getElementById('addressError').textContent = '';
            document.getElementById('phoneError').textContent = '';
            document.getElementById('formError').textContent = '';

            let valid = true;

            if (!isRequired(fullName)) {
                document.getElementById('fullNameError').textContent = 'Name is required';
                valid = false;
            }

            if (!isRequired(birthDate)) {
                document.getElementById('birthDateError').textContent = 'Birth date is required';
                valid = false;
            }

            if (!isRequired(address)) {
                document.getElementById('addressError').textContent = 'Address is required';
                valid = false;
            }

            if (!isRequired(phoneNumber) || !isValidPhone(phoneNumber)) {
                document.getElementById('phoneError').textContent = 'Enter phone in format +7 (xxx) xxx-xx-xx';
                valid = false;
            }

            if (!valid) {
                return;
            }

            saveButton.disabled = true;

            try {
                const updatedProfile = await updateProfile({
                    fullName,
                    birthDate,
                    address,
                    phoneNumber
                });

                setState({
                    user: updatedProfile || {
                        ...profile,
                        fullName,
                        birthDate,
                        address,
                        phoneNumber
                    }
                });

                document.getElementById('formError').style.color = 'green';
                document.getElementById('formError').textContent = 'Profile updated successfully';
            } catch (error) {
                document.getElementById('formError').style.color = '';
                document.getElementById('formError').textContent = error.message;
            } finally {
                saveButton.disabled = false;
            }
        });
    } catch (error) {
        app.innerHTML = `
      ${renderNavbar()}
      <main class="container page">
        ${renderErrorMessage(error.message)}
      </main>
      ${renderFooter()}
    `;

        bindNavbarEvents(app);
    }
}