# Page

> ./Page.js

Top-level layout component that takes ownership of stylesheet loading. The design decision: Page loads FontAwesome and typography as part of mounting; application code does not import or configure these separately.

## Required stylesheets load once - remounting does not re-fetch

- Page checks whether each stylesheet is already present before injecting; remounting in a single-page app does not duplicate link elements or re-trigger network requests
  - new Subject({ styleSheets: ["/lld-dedup-probe.css"], appendTo: document.body }) captures first then document.querySelectorAll('link[rel="stylesheet"][href="/lld-dedup-probe.css"]').length captures afterFirst then new Subject({ styleSheets: ["/lld-dedup-probe.css"], appendTo: document.body }) captures second -> afterFirst === 1 && document.querySelectorAll('link[rel="stylesheet"][href="/lld-dedup-probe.css"]').length === 1

## A stylesheet is scoped by fetching it; otherwise it is linked

A caller that needs a stylesheet confined to part of the page gives it a `scope`, and the only way to
wrap third-party CSS in a selector is to fetch the text and re-emit it. Without a scope there is
nothing to rewrite, so the ordinary link is used.

- an entry with a `scope` is fetched and its rules are emitted inline under that selector; a plain URL becomes a stylesheet link
  - new Subject({ styleSheets: ["/lld-plain.css"], appendTo: document.body }) captures p -> document.querySelectorAll('link[rel="stylesheet"][href="/lld-plain.css"]').length === 1

## Page sets a full-height flex baseline at construction

- height: 100% and flex display are applied as inline styles at construction
  - does a Page element have height: 100% applied at construction?

## A stylesheet list tolerates gaps

Stylesheet lists are usually built by concatenating conditionals, so holes in them are normal rather than a mistake. A hole is skipped; the entries around it still load.

- falsy entries in `styleSheets` are skipped and the real entries beside them are still injected
  - new Subject({ styleSheets: [null, "/real.css", undefined, ""], appendTo: document.body }) captures p -> Array.from(document.querySelectorAll("link[rel=stylesheet]")).some(l => l.getAttribute("href") === "/real.css")
