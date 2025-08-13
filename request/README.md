# request

HTTP request library with intelligent caching, subscriptions, and cache invalidation.

## Quick Start

```js
import { GET, POST, PATCH, DELETE } from './request';

// Basic request
const users = await GET('/users');

// Cached request with live updates
await GET('/users', {
	apiId: 'users',
	onRefetch: result => updateUI(result.body),
});

// Mutation that triggers automatic refetch
await POST('/users', {
	body: newUser,
	invalidates: ['users'],
});
```

## Why This Library?

A **reactive HTTP client** that bridges simple fetch wrappers and complex data management libraries. Get automatic caching, subscriptions, and cache invalidation without framework dependencies or configuration.

```js
// Traditional: manual cache management
const users = await fetch('/users').then(r => r.json());
updateUI(users);
// Later... manual refetch after mutations
await fetch('/users', { method: 'POST', body: JSON.stringify(newUser) });
const updated = await fetch('/users').then(r => r.json());
updateUI(updated);

// This library: reactive and automatic
await GET('/users', {
	apiId: 'users',
	onRefetch: result => updateUI(result.body),
});
await POST('/users', { body: newUser, invalidates: ['users'] }); // Auto-refetch
```

## Core Concepts

### Caching

- GET requests cache automatically
- Mutations (POST/PUT/PATCH/DELETE) cache by default **unless** they include an `invalidates` array
- Cache expires after 60 seconds by default

```js
// These WILL cache:
await POST('/users', { body: newUser });
await PATCH('/users/123', { body: updates });

// These will NOT cache (due to invalidates):
await POST('/users', { body: newUser, invalidates: ['users'] });
await PATCH('/users/123', { body: updates, invalidates: ['users'] });
```

### Subscriptions

- Use `onRefetch` callback to react to data changes
- Subscriptions receive both success and error responses
- Callbacks may fire multiple times (initial request, cache hits, refetches)

### Cache Invalidation

When a successful mutation includes an `invalidates` array:

1. **Clear**: Matching cache entries are deleted
2. **Refetch**: Active subscriptions automatically fetch fresh data
3. **Notify**: Subscription callbacks receive the updated data

**Important**: Invalidated caches with active subscriptions are immediately repopulated with fresh data.

```js
// Setup subscription
await GET('/users', {
	apiId: 'users',
	onRefetch: data => updateUI(data),
});

// This will:
// 1. Delete cached '/users' data
// 2. Refetch '/users' with fresh data
// 3. Call updateUI() with new data
await POST('/users', {
	body: newUser,
	invalidates: ['users'],
});
```

Cache invalidation only occurs when mutations are **successful** (status 200-299). Failed requests will not clear any caches.

```js
// If this fails (status 400/500), caches remain untouched
await POST('/users', {
	body: invalidData,
	invalidates: ['users'],
});
```

### Response Success

Responses with status codes 200-299 are considered successful (`result.success = true`). All other status codes are treated as failures.

```js
const result = await GET('/users/404');
console.log(result.success); // false
console.log(result.body); // Error response body
```

## API

### Methods

```js
GET(url, options);
POST(url, options);
PUT(url, options);
PATCH(url, options);
DELETE(url, options);
```

### Key Options

| Option          | Description              | Example                           |
| --------------- | ------------------------ | --------------------------------- |
| `apiId`         | Subscription identifier  | `'users'`                         |
| `invalidates`   | Cache keys to clear      | `['users', 'stats']`              |
| `onRefetch`     | Response callback        | `(result) => update(result.body)` |
| `urlParameters` | Replace `:param` in URLs | `{ id: '123' }`                   |
| `body`          | Request body             | `{ name: 'John' }`                |

### Cache vs Subscription IDs

| Option    | Purpose              | Default                | Use Case                              |
| --------- | -------------------- | ---------------------- | ------------------------------------- |
| `apiId`   | Groups subscriptions | `method + originalUrl` | Share updates across related requests |
| `cacheId` | Cache storage key    | `method + finalUrl`    | Separate cache for different data     |

```js
// Same subscription group, different cache
await GET('/users', {
	apiId: 'users', // Shared subscriptions
	cacheId: 'users-page-1', // Separate cache entry
	searchParameters: { page: 1 },
});

await GET('/users', {
	apiId: 'users', // Same subscription group
	cacheId: 'users-page-2', // Different cache entry
	searchParameters: { page: 2 },
});

// This invalidates only page 1, but notifies both subscriptions
await POST('/users', { invalidates: ['users-page-1'] });
```

### Result Object

```js
{
  success: boolean,    // True if status 200-299
  body: any,          // Parsed response
  refetch(),          // Re-run request
  subscribe(),        // Add subscription
  unsubscribe()       // Remove subscription
}
```

## URL Parameters

Replace `:param` patterns with actual values:

```js
await GET('/users/:id', {
	urlParameters: { id: '123' },
});
// Requests: /users/123
```

## CRUD Example

```js
// Define API
export const getUsers = options => GET('/users', { apiId: 'users', ...options });

export const createUser = data => POST('/users', { body: data, invalidates: ['users'] });

export const updateUser = (id, data) =>
	PATCH('/users/:id', {
		urlParameters: { id },
		body: data,
		invalidates: ['users'],
	});

// Use with subscriptions
await getUsers({
	onRefetch: result => renderUsers(result.body),
});

// This triggers automatic refetch above
await createUser({ name: 'Alice' });
```

## Advanced Usage

### Manual Subscriptions

```js
const { subscribe } = await GET('/users', { apiId: 'users' });

const { unsubscribe } = subscribe(result => {
	updateUI(result.body);
});
```

### Cache Control

```js
// Custom expiration
await GET('/users', {
	apiId: 'users',
	invalidateAfter: 5 * 60 * 1000, // 5 minutes
});

// Never expire
await GET('/users', {
	apiId: 'users',
	invalidateAfter: false,
});
```

## Troubleshooting

### Cache Not Clearing

If `invalidates` isn't working:

- Check that the mutation was successful (`result.success === true`)
- Verify cache/API IDs match exactly
- Remember: subscribed caches get immediately refetched

### Multiple Callback Calls

Subscription callbacks may fire multiple times due to:

- Initial request completion
- Cache hits on subsequent requests
- Refetches after cache invalidation
- Manual `refetch()` calls

```js
// Design for multiple calls
const onRefetch = result => {
	// This may run several times
	updateUI(result.body);
};
```

### Status Code Behavior

The library treats status codes as follows:

- 200-299: Success (`result.success = true`)
- All others: Failure (`result.success = false`)

```js
const result404 = await GET('/not-found'); // 404
console.log(result404.success); // false

const result500 = await GET('/server-error'); // 500
console.log(result500.success); // false

const result201 = await POST('/users', { body: user }); // 201
console.log(result201.success); // true
```
