export function getQueryParams() {
    return new URLSearchParams(window.location.search);
}

export function getMenuStateFromQuery() {
    const params = getQueryParams();

    return {
        page: Number(params.get('page') || 1),
        categories: params.getAll('categories').filter(Boolean),
        vegetarian: params.get('vegetarian') === 'true',
        sorting: params.get('sorting') || ''
    };
}

export function buildMenuQuery({
    page = 1,
    categories = [],
    vegetarian = false,
    sorting = ''
}) {
    const params = new URLSearchParams();

    params.set('page', String(page));

    categories.forEach((category) => {
        if (category) {
            params.append('categories', category);
        }
    });

    if (vegetarian) {
        params.set('vegetarian', 'true');
    }

    if (sorting) {
        params.set('sorting', sorting);
    }

    const queryString = params.toString();

    return queryString ? `?${queryString}` : '';
}