const query = {
	write({ query, fetch }) {
		query = query && !query.startsWith('?') ? `?${query}` : query;

		if (fetch) window.location.search = query;
		else history.replaceState(null, query, query);
	},
	fetch() {
		query.write({ query: window.location.search, fetch: true });
	},
	stringify(obj) {
		return Object.keys(obj)
			.reduce((arr, key) => {
				arr.push(`${key}=${encodeURIComponent(obj[key])}`);
				return arr;
			}, [])
			.join('&');
	},
	parse() {
		const queryObj = {};

		if (!window.location.search.length) return queryObj;

		const queryString = window.location.search.slice(1);
		const urlVariables = queryString.split('&');

		for (let x = 0; x < urlVariables.length; ++x) {
			const [key, value] = urlVariables[x].split('=');

			queryObj[decodeURIComponent(key)] = decodeURIComponent(value);
		}

		return queryObj;
	},
	get(param) {
		return query.parse()[param];
	},
	set() {
		let obj = {};

		if (typeof arguments[0] === 'object') obj = arguments[0];
		else {
			obj[arguments[0]] = arguments[1];
			obj = Object.assign(query.parse(), obj);
		}

		query.write({ query: query.stringify(obj) });
	},
	delete(param) {
		if (!param) return query.write({ query: '' });

		const obj = query.parse();

		delete obj[param];

		query.write({ query: query.stringify(obj) });
	},
};

export default query;
