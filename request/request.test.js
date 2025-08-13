import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { GET, POST, PATCH, DELETE, request, cache, subscriptions } from './request';
import { hydrateUrl } from './hydrateUrl';

describe('request library', () => {
	beforeEach(() => {
		cache.clear();
		subscriptions.clear();

		global.fetch = mock(() =>
			Promise.resolve({
				status: 200,
				headers: new Map([['content-type', 'application/json']]),
				json: () => Promise.resolve({ data: 'test' }),
				text: () => Promise.resolve('test'),
			}),
		);
	});

	afterEach(() => {
		mock.restore();
	});

	describe('hydrateUrl', () => {
		it('should replace colon-prefixed parameters', () => {
			const url = hydrateUrl('/users/:id', { id: '123' });
			expect(url).toBe('/users/123');
		});

		it('should handle multiple parameters', () => {
			const url = hydrateUrl('/users/:userId/posts/:postId', {
				userId: '123',
				postId: '456',
			});
			expect(url).toBe('/users/123/posts/456');
		});

		it('should URI encode parameters', () => {
			const url = hydrateUrl('/search/:query', { query: 'hello world' });
			expect(url).toBe('/search/hello%20world');
		});

		it('should ignore empty or non-string parameters', () => {
			const url = hydrateUrl('/users/:id/:name', {
				id: '123',
				name: '',
				age: 25,
			});
			expect(url).toBe('/users/123/:name');
		});

		it('should work with no parameters', () => {
			const url = hydrateUrl('/users');
			expect(url).toBe('/users');
		});
	});

	describe('basic HTTP methods', () => {
		it('should make GET request', async () => {
			const result = await GET('/users');

			expect(fetch).toHaveBeenCalledWith(
				'/users',
				expect.objectContaining({
					method: 'GET',
					body: null,
				}),
			);
			expect(result.success).toBe(true);
			expect(result.body).toEqual({ data: 'test' });
		});

		it('should make POST request with body', async () => {
			const body = { name: 'John' };
			const result = await POST('/users', { body });

			expect(fetch).toHaveBeenCalledWith(
				'/users',
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify(body),
				}),
			);
			expect(result.success).toBe(true);
		});

		it('should make PATCH request', async () => {
			const body = { name: 'Jane' };
			await PATCH('/users/123', { body });

			expect(fetch).toHaveBeenCalledWith(
				'/users/123',
				expect.objectContaining({
					method: 'PATCH',
					body: JSON.stringify(body),
				}),
			);
		});

		it('should make DELETE request', async () => {
			await DELETE('/users/123');

			expect(fetch).toHaveBeenCalledWith(
				'/users/123',
				expect.objectContaining({
					method: 'DELETE',
					body: null,
				}),
			);
		});
	});

	describe('URL parameter handling', () => {
		it('should hydrate URL parameters', async () => {
			await GET('/users/:id', { urlParameters: { id: '123' } });

			expect(fetch).toHaveBeenCalledWith('/users/123', expect.any(Object));
		});

		it('should add search parameters', async () => {
			await GET('/users', { searchParameters: { page: 1, limit: 10 } });

			expect(fetch).toHaveBeenCalledWith('/users?page=1&limit=10', expect.any(Object));
		});

		it('should combine URL and search parameters', async () => {
			await GET('/users/:id/posts', {
				urlParameters: { id: '123' },
				searchParameters: { page: 1 },
			});

			expect(fetch).toHaveBeenCalledWith('/users/123/posts?page=1', expect.any(Object));
		});
	});

	describe('response handling', () => {
		it('should handle JSON response', async () => {
			const result = await GET('/users');

			expect(result.contentType).toBe('application/json');
			expect(result.body).toEqual({ data: 'test' });
		});

		it('should handle text response', async () => {
			global.fetch = mock(() =>
				Promise.resolve({
					status: 200,
					headers: new Map([['content-type', 'text/plain']]),
					json: () => Promise.resolve({}),
					text: () => Promise.resolve('plain text'),
				}),
			);

			const result = await GET('/users');

			expect(result.contentType).toBe('text/plain');
			expect(result.body).toBe('plain text');
		});

		it('should handle error status codes', async () => {
			global.fetch = mock(() =>
				Promise.resolve({
					status: 404,
					headers: new Map([['content-type', 'application/json']]),
					json: () => Promise.resolve({ error: 'Not found' }),
					text: () => Promise.resolve(''),
				}),
			);

			const result = await GET('/users');

			expect(result.success).toBe(false);
			expect(result.body).toEqual({ error: 'Not found' });
		});

		it('should handle 500 error status codes', async () => {
			global.fetch = mock(() =>
				Promise.resolve({
					status: 500,
					headers: new Map([['content-type', 'application/json']]),
					json: () => Promise.resolve({ error: 'Server error' }),
					text: () => Promise.resolve(''),
				}),
			);

			const result = await GET('/users');

			expect(result.success).toBe(false);
			expect(result.body).toEqual({ error: 'Server error' });
		});

		it('should correctly identify success status codes', async () => {
			global.fetch = mock(() =>
				Promise.resolve({
					status: 200,
					headers: new Map([['content-type', 'application/json']]),
					json: () => Promise.resolve({ data: 'success' }),
					text: () => Promise.resolve(''),
				}),
			);
			let result = await GET('/test-200');
			expect(result.success).toBe(true);

			global.fetch = mock(() =>
				Promise.resolve({
					status: 201,
					headers: new Map([['content-type', 'application/json']]),
					json: () => Promise.resolve({ data: 'created' }),
					text: () => Promise.resolve(''),
				}),
			);
			result = await GET('/test-201');
			expect(result.success).toBe(true);

			global.fetch = mock(() =>
				Promise.resolve({
					status: 299,
					headers: new Map([['content-type', 'application/json']]),
					json: () => Promise.resolve({ data: 'success' }),
					text: () => Promise.resolve(''),
				}),
			);
			result = await GET('/test-299');
			expect(result.success).toBe(true);

			global.fetch = mock(() =>
				Promise.resolve({
					status: 300,
					headers: new Map([['content-type', 'application/json']]),
					json: () => Promise.resolve({ error: 'redirect' }),
					text: () => Promise.resolve(''),
				}),
			);
			result = await GET('/test-300');
			expect(result.success).toBe(false);

			global.fetch = mock(() =>
				Promise.resolve({
					status: 400,
					headers: new Map([['content-type', 'application/json']]),
					json: () => Promise.resolve({ error: 'bad request' }),
					text: () => Promise.resolve(''),
				}),
			);
			result = await GET('/test-400');
			expect(result.success).toBe(false);
		});
	});

	describe('caching', () => {
		it('should cache GET requests by default', async () => {
			await GET('/users');
			await GET('/users');

			expect(fetch).toHaveBeenCalledTimes(1);
			expect(cache.size).toBe(1);
		});

		it('should cache POST requests by default (when no invalidates)', async () => {
			await POST('/users', { body: { name: 'John' } });
			await POST('/users', { body: { name: 'John' } });

			expect(fetch).toHaveBeenCalledTimes(1);
		});

		it('should not cache POST requests with invalidates', async () => {
			await POST('/users', { body: { name: 'John' }, invalidates: [] });
			await POST('/users', { body: { name: 'John' }, invalidates: [] });

			expect(fetch).toHaveBeenCalledTimes(2);
		});

		it('should respect cache option', async () => {
			await GET('/users', { cache: false });
			await GET('/users', { cache: false });

			expect(fetch).toHaveBeenCalledTimes(2);
			expect(cache.size).toBe(0);
		});

		it('should use custom cacheId', async () => {
			await GET('/users', { cacheId: 'custom-cache' });

			expect(cache.has('custom-cache')).toBe(true);
		});

		it('should use function for cacheId', async () => {
			const cacheIdFn = mock(() => 'dynamic-cache');
			await GET('/users', { cacheId: cacheIdFn });

			expect(cacheIdFn).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
					cacheId: cacheIdFn,
				}),
			);
			expect(cache.has('dynamic-cache')).toBe(true);
		});

		it('should expire cache after invalidateAfter time', async () => {
			await GET('/users', { invalidateAfter: 100 });

			expect(cache.size).toBe(1);

			await new Promise(resolve => setTimeout(resolve, 150));

			expect(cache.size).toBe(0);
		});

		it('should not expire cache when invalidateAfter is false', async () => {
			await GET('/users', { invalidateAfter: false });

			const cacheEntry = Array.from(cache.values())[0];
			expect(cacheEntry.timeout).toBeUndefined();
		});

		it('should invalidate cache manually', async () => {
			const result = await GET('/users');

			expect(cache.size).toBe(1);

			result.invalidateCache();

			expect(cache.size).toBe(0);
		});
	});

	describe('subscriptions', () => {
		it('should create subscription with onRefetch', async () => {
			const onRefetch = mock();
			const result = await GET('/users', { apiId: 'users', onRefetch });

			expect(result.subscriptionId).toBeTruthy();
			expect(result.unsubscribe).toBeFunction();
			expect(subscriptions.has('users')).toBe(true);
			expect(onRefetch).toHaveBeenCalled();
		});

		it('should call subscription on refetch', async () => {
			const onRefetch = mock();
			const result = await GET('/users', { apiId: 'users', onRefetch });

			const initialCalls = onRefetch.mock.calls.length;

			await result.refetch();

			expect(onRefetch.mock.calls.length).toBeGreaterThan(initialCalls);
		});

		it('should unsubscribe properly', async () => {
			const onRefetch = mock();
			const result = await GET('/users', { apiId: 'users', onRefetch });

			result.unsubscribe();

			const subscription = subscriptions.get('users');
			expect(subscription[result.subscriptionId]).toBeUndefined();
		});

		it('should handle multiple subscriptions to same apiId', async () => {
			const onRefetch1 = mock();
			const onRefetch2 = mock();

			await GET('/users', { apiId: 'users', onRefetch: onRefetch1 });
			await GET('/users', { apiId: 'users', onRefetch: onRefetch2 });

			const subscription = subscriptions.get('users');
			expect(Object.keys(subscription).length).toBeGreaterThan(2);
		});

		it('should use function for apiId', async () => {
			const apiIdFn = mock(() => 'dynamic-api');
			const onRefetch = mock();

			await GET('/users', { apiId: apiIdFn, onRefetch });

			expect(apiIdFn).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
					apiId: apiIdFn,
				}),
			);
			expect(subscriptions.has('dynamic-api')).toBe(true);
		});

		it('should subscribe manually', async () => {
			const result = await GET('/users', { apiId: 'users' });
			const callback = mock();

			const { subscriptionId, unsubscribe } = result.subscribe(callback);

			expect(subscriptionId).toBeTruthy();
			expect(unsubscribe).toBeFunction();
			expect(subscriptions.get('users')[subscriptionId]).toBeDefined();
		});
	});

	describe('cache invalidation', () => {
		it('should invalidate cache on successful mutation', async () => {
			await GET('/users', { apiId: 'users' });
			expect(cache.size).toBe(1);

			await POST('/users', {
				body: { name: 'John' },
				invalidates: ['users'],
			});

			expect(cache.size).toBe(0);
		});

		it('should not invalidate cache on failed mutation', async () => {
			global.fetch = mock()
				.mockResolvedValueOnce({
					status: 200,
					headers: new Map([['content-type', 'application/json']]),
					json: () => Promise.resolve({ data: 'users' }),
					text: () => Promise.resolve(''),
				})
				.mockResolvedValueOnce({
					status: 500,
					headers: new Map([['content-type', 'application/json']]),
					json: () => Promise.resolve({ error: 'Server error' }),
					text: () => Promise.resolve(''),
				});

			await GET('/users', { apiId: 'users' });
			expect(cache.size).toBe(1);

			await POST('/users', {
				body: { name: 'John' },
				invalidates: ['users'],
			});

			expect(cache.size).toBe(1);
		});

		it('should refetch subscriptions on invalidation', async () => {
			const onRefetch = mock();

			await GET('/users', { apiId: 'users', onRefetch });
			const initialCalls = onRefetch.mock.calls.length;

			await POST('/users', {
				body: { name: 'John' },
				invalidates: ['users'],
			});

			expect(onRefetch.mock.calls.length).toBeGreaterThan(initialCalls);
		});

		it('should handle array invalidation', async () => {
			await GET('/users', { apiId: 'users' });
			await GET('/posts', { apiId: 'posts' });
			expect(cache.size).toBe(2);

			await POST('/refresh', { invalidates: ['users', 'posts'] });

			expect(cache.size).toBe(0);
		});

		it('should match cacheId for invalidation', async () => {
			await GET('/users', { cacheId: 'custom-users' });
			expect(cache.size).toBe(1);

			await POST('/users', { invalidates: ['custom-users'] });

			expect(cache.size).toBe(0);
		});
	});

	describe('enabled option', () => {
		it('should not make request when enabled is false', async () => {
			const result = await GET('/users', { enabled: false });

			expect(fetch).not.toHaveBeenCalled();
			expect(result.success).toBe(null);
			expect(result.body).toBe(null);
		});

		it('should call onRefetch when disabled if isRefetch is true', async () => {
			const onRefetch = mock();

			await GET('/users', { enabled: false, onRefetch, isRefetch: true });

			expect(onRefetch).toHaveBeenCalledTimes(1);
		});
	});

	describe('fetch options', () => {
		it('should merge custom fetch options', async () => {
			const fetchOptions = {
				headers: { Authorization: 'Bearer token' },
				credentials: 'include',
			};

			await GET('/users', { fetchOptions });

			expect(fetch).toHaveBeenCalledWith(
				'/users',
				expect.objectContaining({
					credentials: 'include',
					headers: { Authorization: 'Bearer token' },
					method: 'GET',
					body: null,
				}),
			);
		});

		it('should allow overriding content-type', async () => {
			const fetchOptions = {
				headers: { 'Content-Type': 'text/plain' },
			};

			await GET('/users', { fetchOptions });

			expect(fetch).toHaveBeenCalledWith(
				'/users',
				expect.objectContaining({
					headers: { 'Content-Type': 'text/plain' },
				}),
			);
		});
	});

	describe('result object', () => {
		it('should return complete result object', async () => {
			const result = await GET('/users/:id', {
				urlParameters: { id: '123' },
				searchParameters: { include: 'posts' },
				apiId: 'user-123',
			});

			expect(result).toMatchObject({
				originalUrl: '/users/:id',
				url: '/users/123?include=posts',
				apiId: 'user-123',
				cacheId: 'GET/users/123?include=posts',
				success: true,
				contentType: 'application/json',
				body: { data: 'test' },
			});

			expect(result.options).toBeDefined();
			expect(result.response).toBeDefined();
			expect(result.refetch).toBeFunction();
			expect(result.subscribe).toBeFunction();
			expect(result.invalidateCache).toBeFunction();
		});

		it('should generate default apiId and cacheId', async () => {
			const result = await GET('/users');

			expect(result.apiId).toBe('GET/users');
			expect(result.cacheId).toBe('GET/users');
		});
	});

	describe('edge cases', () => {
		it('should handle empty response body', async () => {
			global.fetch = mock(() =>
				Promise.resolve({
					status: 204,
					headers: new Map(),
					json: () => Promise.reject(new Error('No content')),
					text: () => Promise.resolve(''),
				}),
			);

			const result = await GET('/users');

			expect(result.success).toBe(true);
			expect(result.body).toBe('');
		});

		it('should handle network errors', async () => {
			global.fetch = mock(() => Promise.reject(new Error('Network error')));

			await expect(GET('/users')).rejects.toThrow('Network error');
		});

		it('should handle concurrent requests to same endpoint with different cache behavior', async () => {
			const promises = [
				GET('/users', { apiId: 'users-1' }),
				GET('/users', { apiId: 'users-2' }),
				GET('/users', { apiId: 'users-3' }),
			];

			await Promise.all(promises);

			expect(fetch).toHaveBeenCalledTimes(3);
		});

		it('should handle subscription refetch behavior', async () => {
			const onRefetch = mock();

			const result = await GET('/users', { apiId: 'users', onRefetch });
			const initialCalls = onRefetch.mock.calls.length;

			await request('/users', {
				method: 'GET',
				apiId: 'users',
				isRefetch: result.subscriptionId,
				onRefetch,
			});

			expect(onRefetch.mock.calls.length).toBeGreaterThan(initialCalls);
		});
	});

	describe('complex scenarios', () => {
		it('should handle full CRUD workflow', async () => {
			const onRefetch = mock();

			await GET('/users', { apiId: 'users', onRefetch });
			const initialCalls = onRefetch.mock.calls.length;

			await POST('/users', {
				body: { name: 'John' },
				invalidates: ['users'],
			});
			expect(onRefetch.mock.calls.length).toBeGreaterThan(initialCalls);

			const afterCreate = onRefetch.mock.calls.length;

			await PATCH('/users/:id', {
				urlParameters: { id: '123' },
				body: { name: 'Jane' },
				invalidates: ['users'],
			});
			expect(onRefetch.mock.calls.length).toBeGreaterThan(afterCreate);

			const afterUpdate = onRefetch.mock.calls.length;

			await DELETE('/users/:id', {
				urlParameters: { id: '123' },
				invalidates: ['users'],
			});
			expect(onRefetch.mock.calls.length).toBeGreaterThan(afterUpdate);
		});

		it('should handle different cache and subscription keys', async () => {
			const onRefetch = mock();

			await GET('/users/page1', {
				apiId: 'users',
				cacheId: 'users-page-1',
				onRefetch,
			});

			await GET('/users/page2', {
				apiId: 'users',
				cacheId: 'users-page-2',
			});

			expect(cache.size).toBe(2);
			expect(subscriptions.has('users')).toBe(true);

			const initialCalls = onRefetch.mock.calls.length;

			const postResult = await POST('/users', {
				body: { name: 'John' },
				invalidates: ['users-page-1'],
			});

			expect(postResult.success).toBe(true);

			expect(onRefetch.mock.calls.length).toBeGreaterThan(initialCalls);

			expect(cache.has('users-page-1')).toBe(true);
			expect(cache.has('users-page-2')).toBe(true);
			expect(cache.size).toBe(2);
		});
	});
});
