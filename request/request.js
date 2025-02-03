import { nanoid } from 'nanoid';

import { hydrateUrl } from './hydrateUrl';

export const cache = new Map();
export const subscriptions = new Map();

/** @typedef {(url: string, options: {invalidateAfter: number, invalidates: Array, cache: boolean, isRefetch: boolean, onRefetch: Function, enabled: boolean, urlParameters: object, searchParameters: object}) => object} Request */
/** @type {Request} */
export const request = async (url, options = {}) => {
	const {
		invalidateAfter = 60 * 1000,
		invalidates,
		cache: useCache = invalidates ? false : true,
		isRefetch,
		onRefetch,
		enabled = true,
		urlParameters,
		searchParameters,
		...fetchOptions
	} = options;

	if (!enabled) {
		const response = {
			url,
			options,
			refetch: async overrides => await request.call(this, url, { isRefetch: true, ...options, ...overrides }),
		};

		if (onRefetch && isRefetch) onRefetch(response);

		return response;
	}

	if (urlParameters) url = hydrateUrl(url, urlParameters);
	if (searchParameters) url = `${url}?${new URLSearchParams(searchParameters)}`;

	const id = options.id || options.method + url;

	if (useCache && cache.has(id)) return cache.get(id).response;

	let response = await fetch(url, {
		headers: { 'Content-Type': 'application/json' },
		...fetchOptions,
		...(options.body ? { body: JSON.stringify(options.body) } : {}),
	});

	const success = response.status % 200 < 100;
	const contentType = response.headers.get('content-type');

	response = {
		url,
		options,
		response,
		contentType,
		body: await (contentType && contentType.includes('application/json') ? response.json() : response.text()),
		success,
		subscribe: callback => {
			const subscriptionId = nanoid(5);
			const unsubscribe = () => {
				const newSubscription = subscriptions.get(id);
				delete newSubscription[subscriptionId];

				subscriptions.set(id, newSubscription);
			};
			const refetch = async overrides =>
				await request.call(this, url, { isRefetch: subscriptionId, ...options, ...overrides });

			const subscription = {
				[subscriptionId]: {
					onRefetch: callback,
					unsubscribe,
				},
			};

			if (!subscriptions.has(id)) subscriptions.set(id, { refetch, ...subscription });
			else subscriptions.set(id, { ...subscriptions.get(id), ...subscription });

			return { subscriptionId, unsubscribe, refetch };
		},
	};

	if (success && invalidates) {
		cache.forEach(({ invalidate: dropCache }, _id) => {
			if (
				invalidates.some(invalidate => {
					if (Array.isArray(_id)) {
						return Array.isArray(invalidate) ? invalidate === _id : _id.includes(invalidate);
					} else {
						return Array.isArray(invalidate) ? false : _id === invalidate;
					}
				})
			) {
				dropCache();
			}
		});

		subscriptions.forEach(({ refetch }, _id) => {
			if (
				invalidates.some(invalidate => {
					if (Array.isArray(_id)) {
						return Array.isArray(invalidate) ? invalidate === _id : _id.includes(invalidate);
					} else {
						return Array.isArray(invalidate) ? false : _id === invalidate;
					}
				})
			) {
				refetch();
			}
		});
	}

	const invalidate = () => {
		cache.delete(id);
	};

	if (useCache) {
		if (cache.get(id)?.timeout) clearTimeout(cache.get(id).timeout);

		cache.set(id, {
			invalidate,
			response,
			...(invalidateAfter ? { timeout: setTimeout(invalidate, invalidateAfter) } : {}),
		});

		response.invalidate = invalidate;
	}

	if (subscriptions.has(id)) {
		Object.values(subscriptions.get(id)).forEach(({ onRefetch: listener }) => listener?.(response));
	}

	if (onRefetch) {
		if (isRefetch) {
			response.subscriptionId = isRefetch;
			response.unsubscribe = subscriptions.get(id)?.[isRefetch]?.unsubscribe;
			response.refetch = async overrides => await request.call(this, url, { isRefetch, ...options, ...overrides });

			if (subscriptions.get(id)?.[isRefetch]) onRefetch(response);
		} else {
			const { subscriptionId, unsubscribe, refetch } = response.subscribe(onRefetch);

			response.subscriptionId = subscriptionId;
			response.unsubscribe = unsubscribe;
			response.refetch = refetch;
		}
	} else {
		response.refetch = async overrides => await request.call(this, url, { isRefetch: true, ...options, ...overrides });
	}

	return response;
};

/** @type {Request} */
export const GET = async (url, options = {}) => await request(url, { method: 'GET', ...options });
/** @type {Request} */
export const POST = async (url, options = {}) => await request(url, { method: 'POST', ...options });
/** @type {Request} */
export const PUT = async (url, options = {}) => await request(url, { method: 'PUT', ...options });
/** @type {Request} */
export const PATCH = async (url, options = {}) => await request(url, { method: 'PATCH', ...options });
/** @type {Request} */
export const DELETE = async (url, options = {}) => await request(url, { method: 'DELETE', ...options });
