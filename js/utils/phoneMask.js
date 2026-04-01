function formatPhone(value) {
    let digits = value.replace(/\D/g, '');

    if (digits.startsWith('8')) {
        digits = `7${digits.slice(1)}`;
    }

    if (!digits.startsWith('7')) {
        digits = `7${digits}`;
    }

    digits = digits.slice(0, 11);

    const local = digits.slice(1);
    let result = '+7';

    if (local.length > 0) {
        result += ` (${local.slice(0, 3)}`;
    }

    if (local.length >= 3) {
        result += ')';
    }

    if (local.length > 3) {
        result += ` ${local.slice(3, 6)}`;
    }

    if (local.length > 6) {
        result += `-${local.slice(6, 8)}`;
    }

    if (local.length > 8) {
        result += `-${local.slice(8, 10)}`;
    }

    return result;
}

export function applyPhoneMask(input) {
    input.addEventListener('focus', () => {
        if (!input.value) {
            input.value = '+7';
        }
    });

    input.addEventListener('input', () => {
        input.value = formatPhone(input.value);
    });

    input.addEventListener('blur', () => {
        if (input.value === '+7') {
            input.value = '';
        }
    });

    if (input.value) {
        input.value = formatPhone(input.value);
    }
}