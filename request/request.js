import { nanoid } from 'nanoid';

import { hydrateUrl } from './hydrateUrl';

export const cache = new Map();
export const subscriptions = new Map();

const checkInvalidates = (invalidates, { cacheId, apiId }) => {
	return invalidates.some(invalidate => {
		let _isInvalidated = false;

		if (Array.isArray(cacheId)) {
			_isInvalidated = Array.isArray(invalidate) ? invalidate === cacheId : cacheId.includes(invalidate);
		} else {
			_isInvalidated = Array.isArray(invalidate) ? false : cacheId === invalidate;
		}

		if (!_isInvalidated) {
			if (Array.isArray(apiId)) {
				_isInvalidated = Array.isArray(invalidate) ? invalidate === apiId : apiId.includes(invalidate);
			} else {
				_isInvalidated = Array.isArray(invalidate) ? false : apiId === invalidate;
			}
		}

		return _isInvalidated;
	});
};

/**
 * @typedef {object} RequestOptions
 * @property {string|string[]|Function} [id] - Cache identifier (deprecated, use apiId)
 * @property {string|string[]|Function} [apiId] - API endpoint identifier for subscriptions
 * @property {string|string[]|Function} [cacheId] - Cache storage key (defaults to method + hydrated URL)
 * @property {string[]} [invalidates] - Cache keys to clear on successful response
 * @property {number|false} [invalidateAfter] - Cache TTL in milliseconds, false disables
 * @property {boolean} [cache] - Enable caching (auto-detected: true for reads, false for mutations)
 * @property {boolean} [enabled] - Execute request when true
 * @property {Function} [onRefetch] - Callback executed on response (creates subscription)
 * @property {object} [urlParameters] - Values for colon-prefixed URL variables
 * @property {object} [searchParameters] - Query string parameters
 * @property {object} [body] - Request body (JSON serialized for non-GET requests)
 * @property {object} [fetchOptions] - Fetch API options
 * @property {string} [method] - HTTP method
 * @property {boolean} [isRefetch] - Internal flag for subscription refetches
 */

/**
 * @typedef {object} RequestResult
 * @property {string} originalUrl - Original URL before parameter hydration
 * @property {string} url - Final URL with parameters and query string
 * @property {RequestOptions} options - Request configuration used
 * @property {string|string[]} apiId - API endpoint identifier
 * @property {string|string[]} cacheId - Cache storage key
 * @property {string|null} subscriptionId - Subscription ID if onRefetch provided
 * @property {Function} unsubscribe - Remove subscription
 * @property {Response} response - Fetch Response object
 * @property {boolean} success - True if status 200-299
 * @property {string|null} contentType - Response Content-Type header
 * @property {*} body - Parsed response body (JSON or text)
 * @property {Function} invalidateCache - Clear this request's cache entry
 * @property {Function} refetch - Re-execute request with optional overrides
 * @property {Function} subscribe - Create subscription to this API endpoint
 */

/**
 * Executes HTTP request with caching, subscriptions, and invalidation
 * @param {string} url - Request URL with optional colon-prefixed parameters
 * @param {RequestOptions} [options] - Request configuration
 * @returns {Promise<RequestResult>} Request result with response data and utilities
 */
export const request = async (url, options = {}) => {
	const {
		apiId: apiIdOption = options.id,
		invalidateAfter = 60 * 1000,
		invalidates,
		cache: useCache = invalidates ? false : true,
		isRefetch = false,
		onRefetch,
		enabled = true,
		urlParameters,
		searchParameters,
		method = 'GET',
		fetchOptions,
	} = options;

	let hydratedUrl = url;

	if (urlParameters) hydratedUrl = hydrateUrl(hydratedUrl, urlParameters);
	if (searchParameters) hydratedUrl = `${hydratedUrl}?${new URLSearchParams(searchParameters)}`;

	const apiId = (typeof apiIdOption === 'function' ? apiIdOption(options) : apiIdOption) || options.method + url;
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
		refetch: async overrides => await request.call(this, url, { ...options, isRefetch, ...overrides }),
		subscribe: callback => {
			const subscriptionId = nanoid(5);
			const unsubscribe = () => {
				const newSubscription = subscriptions.get(apiId);
				delete newSubscription[subscriptionId];

				subscriptions.set(apiId, newSubscription);
			};
			const refetch = async overrides => {
				return await request.call(this, url, {
					...options,
					isRefetch: subscriptionId,
					onRefetch: callback,
					...overrides,
				});
			};

			const subscription = { [subscriptionId]: { onRefetch: callback, unsubscribe } };

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

		if (subscriptions.has(apiId)) {
			Object.values(subscriptions.get(apiId)).forEach(({ onRefetch: listener }) => listener?.(cachedResult));
		}

		return cachedResult;
	}

	result.response = await fetch(hydratedUrl, {
		headers: { 'Content-Type': 'application/json' },
		...(options.body && method !== 'GET' ? { body: JSON.stringify(options.body) } : { body: null }),
		...fetchOptions,
		method,
	});
	result.success = Math.floor(result.response.status / 100) === 2;
	result.contentType = result.response.headers.get('content-type');
	result.body = await (result.contentType && result.contentType.includes('application/json')
		? result.response.json()
		: result.response.text());

	if (result.success && invalidates) {
		cache.forEach(({ invalidate: dropCache, apiId: cacheApiId }, _id) => {
			const isInvalidated = checkInvalidates(invalidates, { cacheId: _id, apiId: cacheApiId });

			if (isInvalidated) {
				dropCache();

				if (subscriptions.has(cacheApiId)) subscriptions.get(cacheApiId).refetch();
			}
		});
	}

	if (useCache) {
		if (cache.get(cacheId)?.timeout) clearTimeout(cache.get(cacheId).timeout);

		cache.set(cacheId, {
			apiId,
			invalidate: result.invalidateCache,
			result,
			...(invalidateAfter ? { timeout: setTimeout(result.invalidateCache, invalidateAfter) } : {}),
		});
	}

	if (onRefetch) {
		if (isRefetch) {
			result.subscriptionId = isRefetch;
			result.unsubscribe = subscriptions.get(apiId)?.[isRefetch]?.unsubscribe;
			result.refetch = async overrides => await request.call(this, url, { isRefetch, ...options, ...overrides });
		} else {
			const { subscriptionId, unsubscribe, refetch } = result.subscribe(onRefetch);

			result.subscriptionId = subscriptionId;
			result.unsubscribe = unsubscribe;
			result.refetch = refetch;
		}
	}

	if (subscriptions.has(apiId)) {
		Object.values(subscriptions.get(apiId)).forEach(({ onRefetch: listener }) => listener?.(result));
	}

	return result;
};

/**
 * Executes GET request
 * @param {string} url - Request URL
 * @param {RequestOptions} [options] - Request configuration
 * @returns {Promise<RequestResult>} Request result
 */
export const GET = async (url, options = {}) => await request(url, { method: 'GET', ...options });
/**
 * Executes POST request
 * @param {string} url - Request URL
 * @param {RequestOptions} [options] - Request configuration
 * @returns {Promise<RequestResult>} Request result
 */
export const POST = async (url, options = {}) => await request(url, { method: 'POST', ...options });
/**
 * Executes PUT request
 * @param {string} url - Request URL
 * @param {RequestOptions} [options] - Request configuration
 * @returns {Promise<RequestResult>} Request result
 */
export const PUT = async (url, options = {}) => await request(url, { method: 'PUT', ...options });
/**
 * Executes PATCH request
 * @param {string} url - Request URL
 * @param {RequestOptions} [options] - Request configuration
 * @returns {Promise<RequestResult>} Request result
 */
export const PATCH = async (url, options = {}) => await request(url, { method: 'PATCH', ...options });
/**
 * Executes DELETE request
 * @param {string} url - Request URL
 * @param {RequestOptions} [options] - Request configuration
 * @returns {Promise<RequestResult>} Request result
 */
export const DELETE = async (url, options = {}) => await request(url, { method: 'DELETE', ...options });
