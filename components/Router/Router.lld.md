# Router

> ./Router.js

Hash-based router that maps URL fragments to component classes. The design decision: navigating to the current route is a no-op; the active view is not destroyed and rebuilt when the URL doesn't change.

## Query strings are stripped before route matching

- `#/path?foo=bar` matches the `/path` route; query strings are stripped before matching so callers write route patterns without accounting for query parameters
  - new Subject({ views: { "/path": null }, autoRender: false }) captures r then window.location.hash = "#/path?foo=bar" -> r.route === "/path"

## Route parameters are extracted and passed to the rendered view

- patterns like `/users/:id` match `/users/42` and produce `{ id: '42' }` for the view without any URL parsing at the view level
  - new Subject({ views: { "/users/:id": null }, autoRender: false }) captures r then r.parseRouteParameters("/users/42") captures p -> p.id === "42"
- a path that does not fit the pattern produces no parameters rather than partial ones
  - new Array() captures got then (location.hash = "#/things/42") then new Subject({ views: { "/things/:id": class { constructor(o) { got.push(o.id); this.elem = document.createElement("div"); } } }, appendTo: document.body }) captures r -> r.parseRouteParameters("/things/42").id === "42" && Object.keys(r.parseRouteParameters("/nothing/here")).length === 0 && got.join() === "42"

## Same-route navigation does not rebuild the view

View state is preserved across same-route navigations, so callers do not have to guard against them.

- if the new hash resolves to the same route as what's currently rendered, the component skips re-render
  - new Array() captures renders then window.location.hash = "#/route-a" then new Subject({ views: { "/route-a": Object }, onRenderView: x => renders.push(x) }) captures r then r.view captures firstView then r.renderView() then r.renderView() -> renders.length === 1 && r.view === firstView

## Unmatched routes fall back rather than rendering nothing

- an unmatched hash tries `defaultPath` before showing the notFound component; notFound is the last resort, not the first response to a miss
  - new Array() captures seen then window.location.hash = "#/nowhere" then new Subject({ views: { "/known": function (o) { seen.push("known"); } }, defaultPath: "/known", notFound: function (o) { seen.push("notFound"); } }) captures r then r.renderView() -> seen.includes("known") && seen.includes("notFound") === false

## Where the path comes from is the only difference between the two modes

`hash` mode reads the fragment and `history` mode reads the pathname; everything downstream -- matching, parameters, view construction -- is identical. Keeping the difference to one accessor is what makes the mode a deployment choice rather than a different router.

- in hash mode the path is the fragment, normalised and stripped of any query; in history mode it is the pathname
  - new Array() captures seen then (location.hash = "#/things/42") then new Subject({ views: { "/things/:id": class extends Object {} }, appendTo: document.body }) captures hashed then new Subject({ mode: "history", views: {}, appendTo: document.body }) captures historied -> hashed.path === "/things/42" && historied.path === window.location.pathname
