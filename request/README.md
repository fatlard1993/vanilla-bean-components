# request

HTTP client with intelligent caching, subscriptions, and automatic cache invalidation for reactive web applications.

## Key Features

- **Intelligent caching** - Automatic caching with configurable expiration and invalidation
- **Subscription system** - React to data changes with onRefetch callbacks
- **Cache invalidation** - Automatic refetching when related data changes
- **URL parameter replacement** - Clean `:param` syntax for dynamic URLs
- **Error handling** - Proper success/failure detection with status code handling
- **Zero configuration** - Works out of the box with sensible defaults

## Quick Start

### Basic HTTP Requests

```js
import { GET, POST, PATCH, DELETE } from 'vanilla-bean-components/request';

// Simple GET request
const users = await GET('/users');
console.log(users.body); // Response data

// POST with body
const newUser = await POST('/users', {
	body: { name: 'Alice', email: 'alice@example.com' },
});

// PATCH with URL parameters
const updatedUser = await PATCH('/users/:id', {
	urlParameters: { id: '123' },
	body: { name: 'Alice Smith' },
});
```

### Reactive Data with Subscriptions

Set up automatic UI updates when data changes:

```js
// Subscribe to data changes
await GET('/users', {
	apiId: 'users',
	onRefetch: result => {
		if (result.success) {
			updateUserList(result.body);
		}
	},
});

// This triggers automatic refetch and UI update
await POST('/users', {
	body: { name: 'Bob' },
	invalidates: ['users'], // Triggers refetch above
});
```

### Why This Library?

A **reactive HTTP client** that bridges simple fetch wrappers and complex data management libraries:

```js
// ❌ Traditional: manual cache management
const users = await fetch('/users').then(r => r.json());
updateUI(users);
// Later... manual refetch after mutations
await fetch('/users', { method: 'POST', body: JSON.stringify(newUser) });
const updated = await fetch('/users').then(r => r.json());
updateUI(updated);

// ✅ This library: reactive and automatic
await GET('/users', {
	apiId: 'users',
	onRefetch: result => updateUI(result.body),
});
await POST('/users', { body: newUser, invalidates: ['users'] }); // Auto-refetch
```

## Core Concepts

### Intelligent Caching

**Automatic caching behavior:**

- GET requests cache by default
- Mutations (POST/PUT/PATCH/DELETE) cache **unless** they include `invalidates` array
- Cache expires after 60 seconds by default

```js
// These WILL cache
await POST('/users', { body: newUser });
await PATCH('/users/123', { body: updates });

// These will NOT cache (due to invalidates)
await POST('/users', { body: newUser, invalidates: ['users'] });
await PATCH('/users/123', { body: updates, invalidates: ['users'] });
```

### Subscription System

React to data changes with callback functions:

```js
await GET('/users', {
	apiId: 'users', // Subscription identifier
	onRefetch: result => {
		// Called on: initial request, cache hits, invalidation refetches
		if (result.success) {
			updateUI(result.body);
		} else {
			showError(result.body);
		}
	},
});
```

### Cache Invalidation Pipeline

When a successful mutation includes an `invalidates` array:

1. **Clear** - Matching cache entries are deleted
2. **Refetch** - Active subscriptions automatically fetch fresh data
3. **Notify** - Subscription callbacks receive updated data

```js
// Setup subscription
await GET('/users', {
	apiId: 'users',
	onRefetch: data => updateUserList(data.body),
});

// This triggers the complete pipeline:
// 1. Deletes cached '/users' data
// 2. Refetches '/users' with fresh data
// 3. Calls updateUserList() with new data
await POST('/users', {
	body: newUser,
	invalidates: ['users'],
});
```

**Important:** Cache invalidation only occurs on successful requests (status 200-299).

### Success Detection

Responses with status codes 200-299 are considered successful:

```js
const result = await GET('/users/404');
console.log(result.success); // false - 404 status
console.log(result.body); // Error response body

const result2 = await POST('/users', { body: user });
console.log(result2.success); // true - 201 status
```

## API Reference

### HTTP Methods

```js
GET(url, options?)
POST(url, options?)
PUT(url, options?)
PATCH(url, options?)
DELETE(url, options?)
```

### Core Options

| Option          | Type       | Description                                           |
| --------------- | ---------- | ----------------------------------------------------- |
| `apiId`         | `string`   | Subscription identifier for grouping related requests |
| `cacheId`       | `string`   | Cache storage key (defaults to method + final URL)    |
| `invalidates`   | `string[]` | Cache/API IDs to clear on successful request          |
| `onRefetch`     | `Function` | Callback for data changes `(result) => void`          |
| `body`          | `any`      | Request body (automatically JSON stringified)         |
| `urlParameters` | `object`   | Replace `:param` patterns in URLs                     |

### URL and Caching Options

| Option             | Type            | Default | Description                      |
| ------------------ | --------------- | ------- | -------------------------------- |
| `searchParameters` | `object`        | -       | Query string parameters          |
| `invalidateAfter`  | `number\|false` | `60000` | Cache expiration in milliseconds |
| `headers`          | `object`        | `{}`    | Additional request headers       |

### Response Object

```js
{
	success: boolean,     // True if status 200-299
	body: any,           // Parsed response data
	status: number,      // HTTP status code
	headers: Headers,    // Response headers
	refetch(): Promise,  // Re-run the request
	subscribe(callback): { unsubscribe }, // Add subscription
	unsubscribe(): void  // Remove subscription
}
```

### Cache vs Subscription IDs

| ID Type   | Purpose              | Default                | Use Case                              |
| --------- | -------------------- | ---------------------- | ------------------------------------- |
| `apiId`   | Groups subscriptions | `method + originalUrl` | Share updates across related requests |
| `cacheId` | Cache storage key    | `method + finalUrl`    | Separate cache for different data     |

```js
// Same subscription group, different cache entries
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

// Invalidates only page 1 cache, but notifies both subscriptions
await POST('/users', { invalidates: ['users-page-1'] });
```

## Advanced Usage

### Manual Subscription Management

```js
const result = await GET('/users', { apiId: 'users' });

// Add subscription after initial request
const { unsubscribe } = result.subscribe(result => {
	updateUI(result.body);
});

// Remove subscription when no longer needed
unsubscribe();
```

### Cache Control

```js
// Custom cache expiration
await GET('/users', {
	apiId: 'users',
	invalidateAfter: 5 * 60 * 1000, // 5 minutes
});

// Never expire cache
await GET('/config', {
	apiId: 'config',
	invalidateAfter: false, // Permanent cache
});

// Force fresh data (bypass cache)
await GET('/users', {
	apiId: 'users',
	invalidateAfter: 0, // Immediate expiration
});
```

### URL Parameter Replacement

Replace `:param` patterns with dynamic values:

```js
// Single parameter
await GET('/users/:id', {
	urlParameters: { id: '123' },
}); // Requests: /users/123

// Multiple parameters
await PATCH('/organizations/:orgId/users/:userId', {
	urlParameters: { orgId: 'acme', userId: '123' },
	body: { role: 'admin' },
}); // Requests: /organizations/acme/users/123
```

### Error Handling

```js
const result = await POST('/users', {
	body: invalidData,
	onRefetch: result => {
		if (result.success) {
			showSuccess('User created successfully');
			updateUserList(result.body);
		} else {
			showError(`Failed to create user: ${result.body.message}`);
		}
	},
});

// Handle errors immediately
if (!result.success) {
	console.error('Request failed:', result.status, result.body);
}
```

## Real-World Examples

### User Management API

```js
// API layer with consistent patterns
export const userAPI = {
	// List users with live updates
	getUsers: (options = {}) =>
		GET('/users', {
			apiId: 'users',
			...options,
		}),

	// Create user with automatic list refresh
	createUser: data =>
		POST('/users', {
			body: data,
			invalidates: ['users'],
		}),

	// Update user with automatic list refresh
	updateUser: (id, data) =>
		PATCH('/users/:id', {
			urlParameters: { id },
			body: data,
			invalidates: ['users'],
		}),

	// Delete user with automatic list refresh
	deleteUser: id =>
		DELETE('/users/:id', {
			urlParameters: { id },
			invalidates: ['users'],
		}),
};

// Component usage
class UserManager {
	async init() {
		// Setup reactive user list
		await userAPI.getUsers({
			onRefetch: result => {
				if (result.success) {
					this.renderUsers(result.body);
				}
			},
		});
	}

	async createUser(userData) {
		const result = await userAPI.createUser(userData);
		// User list automatically updates via invalidation

		if (result.success) {
			this.showMessage('User created successfully');
		} else {
			this.showError('Failed to create user');
		}
	}
}
```

### Multi-Resource Dashboard

```js
// Dashboard with multiple data sources
class Dashboard {
	async loadDashboard() {
		// Setup multiple subscriptions
		await Promise.all([
			// Users data
			GET('/users', {
				apiId: 'dashboard-users',
				onRefetch: result => this.updateUsersWidget(result.body),
			}),

			// Statistics data
			GET('/stats', {
				apiId: 'dashboard-stats',
				onRefetch: result => this.updateStatsWidget(result.body),
			}),

			// Recent activity
			GET('/activity', {
				apiId: 'dashboard-activity',
				invalidateAfter: 30 * 1000, // Refresh every 30 seconds
				onRefetch: result => this.updateActivityFeed(result.body),
			}),
		]);
	}

	async createUser(userData) {
		await POST('/users', {
			body: userData,
			// Update both users list and stats
			invalidates: ['dashboard-users', 'dashboard-stats'],
		});
	}
}
```

### Pagination with Caching

```js
class UserList {
	async loadPage(page = 1) {
		return await GET('/users', {
			apiId: 'users', // Shared subscription group
			cacheId: `users-page-${page}`, // Separate cache per page
			searchParameters: { page, limit: 20 },
			onRefetch: result => {
				if (result.success) {
					this.renderPage(page, result.body);
				}
			},
		});
	}

	async createUser(userData) {
		await POST('/users', {
			body: userData,
			// Invalidate all cached pages
			invalidates: Array.from({ length: 10 }, (_, i) => `users-page-${i + 1}`),
		});
	}
}
```

## Troubleshooting

### Cache Not Clearing

If `invalidates` isn't working:

1. **Check request success** - Only successful requests (200-299) trigger invalidation
2. **Verify ID matching** - Cache/API IDs must match exactly
3. **Remember refetch behavior** - Subscribed caches get immediately refetched

```js
const result = await POST('/users', {
	body: invalidData,
	invalidates: ['users'],
});

if (!result.success) {
	console.log('Cache not cleared - request failed');
}
```

### Multiple Callback Executions

Subscription callbacks may fire multiple times due to:

- Initial request completion
- Cache hits on subsequent requests
- Refetches after cache invalidation
- Manual `refetch()` calls

Design callbacks to handle multiple executions:

```js
const onRefetch = result => {
	// This may run several times - design accordingly
	if (result.success) {
		// Idempotent UI updates
		updateUserList(result.body);
	}
};
```

### Memory Management

Subscriptions persist until manually unsubscribed:

```js
class UserComponent {
	constructor() {
		this.subscriptions = [];
	}

	async init() {
		const result = await GET('/users', {
			apiId: 'users',
			onRefetch: result => this.render(result.body),
		});

		this.subscriptions.push(result);
	}

	destroy() {
		// Clean up all subscriptions
		this.subscriptions.forEach(sub => sub.unsubscribe());
		this.subscriptions = [];
	}
}
```

## Performance Considerations

- **Cache efficiency** - Identical requests share cache entries
- **Subscription grouping** - Use consistent `apiId` values for related data
- **Cache expiration** - Balance freshness vs performance with `invalidateAfter`
- **Memory usage** - Unsubscribe from unused subscriptions
