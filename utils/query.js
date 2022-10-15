export const query = {
	write({ query: newQuery, fetch = false }) {
		if (typeof newQuery === 'object') newQuery = query.stringify(newQuery);

		newQuery = newQuery.length && newQuery[0] !== '?' ? `?${newQuery}` : newQuery;

		if (fetch) window.location.search = newQuery;
		else history.replaceState(null, newQuery, newQuery);
	},
	fetch() {
		query.write({ query: window.location.search, fetch: true });
	},
	stringify(obj) {
		return Object.keys(obj)
			.map(key => `${key}=${encodeURIComponent(obj[key])}`)
			.join('&');
	},
	parse() {
		const obj = {};

		if (!window.location.search.length) return obj;

		const variables = window.location.search.slice(1).split('&');

		variables.forEach(variable => {
			const [key, value] = variable.split('=');

			obj[decodeURIComponent(key)] = decodeURIComponent(value);
		});

		return obj;
	},
	get(key) {
		return query.parse()[key];
	},
	set(key, value, fetch) {
		const obj = query.parse();

		obj[key] = value;

		query.write({ query: obj, fetch });
	},
	delete(key, fetch) {
		if (!key) return (window.location.search = '');

		const obj = query.parse();

		delete obj[key];

		query.write({ query: obj, fetch });
	},
};

export default query;
