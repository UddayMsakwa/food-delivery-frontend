export function isRequired(value) {
    return String(value || '').trim().length > 0;
}

export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export function isValidPhone(phone) {
    return /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}-\d{2}$/.test(String(phone).trim());
}