# request

> lld/helpers/request.js

HTTP client with integrated caching and subscriptions. The key design decision is the separation of two identities: `apiId` identifies the method itself — the logical operation — while `cacheId` identifies a specific invocation of that method with a specific configuration (a particular resource ID, a particular page, a particular sort order). This separation makes it possible to subscribe at the method level while caching at the invocation level.

## GET requests are cached by default; writes are not

- GET requests cache their response without any configuration; mutations that declare `invalidates` are not cached — declaring invalidations implies a write

**method:** `getRepeatAndCount`

- a GET request hits the network once; subsequent identical calls serve from cache
  - getRepeatAndCount("/api/test", 2) → 1

**method:** `postRepeatAndCount`

- a POST request is never served from cache; each call hits the network
  - postRepeatAndCount("/api/test", 2) → 2

## Subscriptions react to cache invalidation, not to data changing

**method:** `refetchCountOnInvalidate`

- a subscriber is notified when its cache entry is cleared, triggering a refetch; the subscriber does not poll or watch the underlying data directly
  - refetchCountOnInvalidate("/api/data") → 1

## Subscriptions can be declared before they are active

**method:** `subscriptionRegisteredWhileDisabled`

- subscriptions are established even when `enabled: false`; data dependencies can be declared at component initialization time and activated later
  - subscriptionRegisteredWhileDisabled("/api/data") → true

**method:** `enabledFalseSkips`

- a request with `enabled: false` does not hit the network
  - enabledFalseSkips("/api/data") → 0

## Invalidation is cascading

**method:** `getAndInvalidateSize`

- a successful write with `invalidates` clears all matching cache entries by cacheId or apiId
  - getAndInvalidateSize("/api/test") captures result → result.after === 0

## apiId is the method; cacheId is the invocation

- `apiId` is the subscription key — it identifies the logical operation; `cacheId` is the storage key — it identifies a specific invocation with a specific configuration

**method:** `apiIdInvalidatesAllCaches`

- multiple cacheIds can share one apiId; a write invalidating by apiId clears all of them simultaneously
  - apiIdInvalidatesAllCaches("users") captures result → result.after === 0
