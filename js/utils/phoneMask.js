export function applyPhoneMask(input) {
    input.addEventListener('input', () => {
        const digits = input.value
            .replace(/\D/g, '')
            .replace(/^7/, '')
            .slice(0, 11);

        let result = '+7 ';

        if (digits.length > 0) {
            result += `(${digits.slice(0, 3)}`;
        }

        if (digits.length >= 3) {
            result += ') ';
        }

        if (digits.length > 3) {
            result += digits.slice(3, 6);
        }

        if (digits.length >= 6) {
            result += '-';
        }

        if (digits.length > 6) {
            result += digits.slice(6, 8);
        }

        if (digits.length >= 8) {
            result += '-';
        }

        if (digits.length > 8) {
            result += digits.slice(8, 10);
        }

        if (digits.length >= 10) {
            result += '-';
        }

        if (digits.length > 10) {
            result += digits.slice(10, 11);
        }

        input.value = result;
    });

    input.addEventListener('focus', () => {
        if (!input.value) {
            input.value = '+7 ';
        }
    });
}