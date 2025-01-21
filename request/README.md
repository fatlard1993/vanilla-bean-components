# request

- URL parameter hydration
- Cache and cache-invalidation
- Subscriptions and refetching

## Usage

Define your api usage in one place to configure all your cache id and invalidation links.

Heres a basic CRUD example:

```js
export const getBookmarks = async options => await GET('/bookmarks', { id: 'bookmarks', ...options });

export const getBookmark = async (id, options) =>
	await GET('/bookmarks/:id', { id: ['bookmarks', id], urlParameters: { id }, ...options });

export const createBookmark = async options =>
	await POST('/bookmarks', { invalidates: ['bookmarks', 'categories'], ...options });

export const updateBookmark = async (id, options) =>
	await PATCH('/bookmarks/:id', { invalidates: ['bookmarks', 'categories'], urlParameters: { id }, ...options });

export const deleteBookmark = async (id, options) =>
	await DELETE('/bookmarks/:id', { invalidates: ['bookmarks'], urlParameters: { id }, ...options });
```

## URL Parameter Hydration

A request `url` supports parameter hydration. To utilize this feature simply include `:` prefixed keys in your url and values with matching keys in the `urlParameters` option.

```js
request('/root/:one/static/:two', { urlParameters: { one: 1, two: 2 } });
```

## Cache

There 2 major types of api interactions:

1. A request for data
2. A request to mutate data

`request` supports these 2 distinctions by configuring either the `id` or the `invalidates` option.

- A `request` with an `id` array will cache the response data by default using the `id` as the storage key. Any following `request` executions with the same `id` will return the data in cache instead of requesting new data.
- A `request` with an `invalidates` array will drop any cache stored in the matching keys when a successful response is received

### invalidateAfter

Cached response data is cleared out by default after 60 seconds. To change or disable this behavior you can set the `invalidateAfter` option:

Set to 10 minutes:

```js
request('/users', { id: ['users'], invalidateAfter: 10 * 60 * 1000 });
```

Disable automatic invalidation:

```js
request('/users', { id: ['users'], invalidateAfter: false });
```

## Subscriptions

Any `request` with an `id` can be subscribed to. When a request response resolves it will execute any functions subscribed to that `request().id` with the contents of that response.

There are 2 major was to interact with the subscriptions:

### onRefetch

An `onRefetch` function can be provided to generate an automatic subscription

### subscribe()

A `subscribe` function is provided on the `request` return:

```js
const { subscribe } = request('users');

subscribe(response => {
	console.log('got new users: ', response);
});
```
