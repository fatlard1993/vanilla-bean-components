# Router

> ./Router.js

Hash-based router that maps URL fragments to component classes. The design decision: navigating to the current route is a no-op; the active view is not destroyed and rebuilt when the URL doesn't change.

## Query strings are stripped before route matching

**method:** `hashStripsQueryString`

- `#/path?foo=bar` matches the `/path` route; query strings are stripped before matching so callers write route patterns without accounting for query parameters
  - hashStripsQueryString() → "/path"

## Route parameters are extracted and passed to the rendered view

**method:** `paramExtractedFromRoute`

- patterns like `/users/:id` match `/users/42` and produce `{ id: '42' }` for the view without any URL parsing at the view level
  - paramExtractedFromRoute() → "42"

## Same-route navigation does not rebuild the view

- if the new hash resolves to the same route as what's currently rendered, the component skips re-render
- this preserves view state across same-route navigations without the caller guarding against them
  - does navigating to the currently active route leave the rendered view unchanged?

## Unmatched routes fall back rather than rendering nothing

- an unmatched hash tries `defaultPath` before showing the notFound component
- the notFound component is only shown when no fallback matches either
  - does navigating to an unknown route eventually show the notFound component?
