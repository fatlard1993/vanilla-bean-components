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
		isRefetch = false,
		onRefetch,
		enabled = true,
		urlParameters,
		searchParameters,
		...fetchOptions
	} = options;

	let hydratedUrl = url;

	if (urlParameters) hydratedUrl = hydrateUrl(hydratedUrl, urlParameters);
	if (searchParameters) hydratedUrl = `${hydratedUrl}?${new URLSearchParams(searchParameters)}`;

	const apiId = (typeof options.apiId === 'function' ? options.apiId(options) : options.apiId) || options.method + url;
	const cacheId =
		(typeof options.cacheId === 'function' ? options.cacheId(options) : options.cacheId) ||
		options.method + hydratedUrl;

	const result = {
		originalUrl: url,
		url: hydratedUrl,
		options,
		apiId,
		cacheId,
		subscriptionId: null,
		unsubscribe: () => {},
		response: {},
		success: null,
		contentType: null,
		body: null,
		invalidateCache: () => cache.delete(cacheId),
		refetch: async overrides => await request.call(this, url, { isRefetch, ...options, ...overrides }),
		subscribe: callback => {
			const subscriptionId = nanoid(5);
			const unsubscribe = () => {
				const newSubscription = subscriptions.get(apiId);
				delete newSubscription[subscriptionId];

				subscriptions.set(apiId, newSubscription);
			};
			const refetch = async overrides =>
				await request.call(this, url, { isRefetch: subscriptionId, ...options, ...overrides });

			const subscription = {
				[subscriptionId]: {
					onRefetch: callback,
					unsubscribe,
				},
			};

			if (!subscriptions.has(apiId)) subscriptions.set(apiId, { refetch, ...subscription });
			else subscriptions.set(apiId, { ...subscriptions.get(apiId), ...subscription });

			return { subscriptionId, unsubscribe, refetch };
		},
	};

	if (onRefetch && !isRefetch) {
		const { subscriptionId, unsubscribe, refetch } = result.subscribe(onRefetch);

		result.subscriptionId = subscriptionId;
		result.unsubscribe = unsubscribe;
		result.refetch = refetch;
	}

	if (!enabled) {
		if (onRefetch && isRefetch) onRefetch(result);

		return result;
	}

	if (useCache && cache.has(cacheId)) {
		const cachedResult = cache.get(cacheId).result;

		if (onRefetch && isRefetch) onRefetch(cachedResult);

		return cachedResult;
	}

	result.response = await fetch(hydratedUrl, {
		headers: { 'Content-Type': 'application/json' },
		...fetchOptions,
		...(options.body ? { body: JSON.stringify(options.body) } : {}),
	});
	result.success = result.response.status % 200 < 100;
	result.contentType = result.response.headers.get('content-type');
	result.body = await (result.contentType && result.contentType.includes('application/json')
		? result.response.json()
		: result.response.text());

	if (result.success && invalidates) {
		cache.forEach(({ invalidate: dropCache }, _id) => {
			const isInvalidated = invalidates.some(invalidate => {
				if (Array.isArray(_id)) {
					return Array.isArray(invalidate) ? invalidate === _id : _id.includes(invalidate);
				} else {
					return Array.isArray(invalidate) ? false : _id === invalidate;
				}
			});

			if (isInvalidated) dropCache();
		});

		subscriptions.forEach(({ refetch }, _id) => {
			const isInvalidated = invalidates.some(invalidate => {
				if (Array.isArray(_id)) {
					return Array.isArray(invalidate) ? invalidate === _id : _id.includes(invalidate);
				} else {
					return Array.isArray(invalidate) ? false : _id === invalidate;
				}
			});

			if (isInvalidated) refetch(result);
		});
	}

	if (useCache) {
		if (cache.get(cacheId)?.timeout) clearTimeout(cache.get(cacheId).timeout);

		cache.set(cacheId, {
			invalidate: result.invalidateCache,
			result,
			...(invalidateAfter ? { timeout: setTimeout(result.invalidateCache, invalidateAfter) } : {}),
		});
	}

	if (subscriptions.has(apiId)) {
		Object.values(subscriptions.get(apiId)).forEach(({ onRefetch: listener }) => listener?.(result));
	}

	if (onRefetch) {
		if (isRefetch) {
			result.subscriptionId = isRefetch;
			result.unsubscribe = subscriptions.get(apiId)?.[isRefetch]?.unsubscribe;
			result.refetch = async overrides => await request.call(this, url, { isRefetch, ...options, ...overrides });

			if (subscriptions.get(apiId)?.[isRefetch]) onRefetch(result);
		} else {
			const { subscriptionId, unsubscribe, refetch } = result.subscribe(onRefetch);

			result.subscriptionId = subscriptionId;
			result.unsubscribe = unsubscribe;
			result.refetch = refetch;
		}
	}

	return result;
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
