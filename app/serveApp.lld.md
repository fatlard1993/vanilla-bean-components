# Serving an app

> ./serveApp.js

The pieces every app server repeats: the page, the error handler, and the check that keeps other sites out.

## A write or a socket comes only from this app's own pages

WebSockets get no CORS protection at all, and a cross-site form post needs no preflight, so a page the browser happens to visit can reach any server on the network unless the server looks at where the request came from. Reads are left alone: they change nothing, and a link to the app from anywhere has to work.

- a write sent by another site's page is refused
  - new Array() captures start then Subject.sameOrigin({ method: "POST", headers: { get: name => ({ origin: "http://evil.test", host: "me:8033" })[name] ?? null } }) captures allowed -> allowed === false
- a socket opened by another site's page is refused, though it arrives as a GET
  - new Array() captures start then Subject.sameOrigin({ method: "GET", headers: { get: name => ({ origin: "http://evil.test", host: "me:8033", upgrade: "websocket" })[name] ?? null } }) captures allowed -> allowed === false
- an origin of "null" (a sandboxed frame, a file: page) is never this host
  - new Array() captures start then Subject.sameOrigin({ method: "DELETE", headers: { get: name => ({ origin: "null", host: "me:8033" })[name] ?? null } }) captures allowed -> allowed === false
- the app's own pages, and a client outside any browser (which sends no Origin), get through
  - new Array() captures start then Subject.sameOrigin({ method: "POST", headers: { get: name => ({ origin: "http://me:8033", host: "me:8033" })[name] ?? null } }) captures allowed -> allowed === true
  - new Array() captures start then Subject.sameOrigin({ method: "POST", headers: { get: name => ({ host: "me:8033" })[name] ?? null } }) captures allowed -> allowed === true

## The page, a file, the API, or nothing

The root and index.html are the page; a file under the root is itself; a path under the API prefix is left for the API's
own router; a route with no extension is the page again, and a missing asset is a 404 rather than the page under its
name.

- the root and index.html are the page
  - new Array() captures start then await Subject.serveApp(new Request("http://me/"), { root: "app" }) captures root then await Subject.serveApp(new Request("http://me/index.html"), { root: "app" }) captures index -> root.headers.get("content-type").startsWith("text/html") && index.headers.get("content-type").startsWith("text/html")
- a file under the root is served as itself, not as the page
  - new Array() captures start then await Subject.serveApp(new Request("http://me/README.md"), { root: "app" }) captures file -> file instanceof Response && !(file.headers.get("content-type") ?? "").startsWith("text/html")
- a path under the API prefix, or the prefix itself, is left for the API
  - new Array() captures start then await Subject.serveApp(new Request("http://me/api/games"), { root: "app" }) captures under then await Subject.serveApp(new Request("http://me/api"), { root: "app" }) captures exact -> under === undefined && exact === undefined
- a route is the page; a missing asset is nothing
  - new Array() captures start then await Subject.serveApp(new Request("http://me/games/12"), { root: "app" }) captures route then await Subject.serveApp(new Request("http://me/chunk-old.js"), { root: "app" }) captures asset -> route.headers.get("content-type").startsWith("text/html") && asset === undefined
