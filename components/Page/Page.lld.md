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

## Page sets a full-height flex baseline, under the caller's style

Page follows the Component contract like any other: no constructor of its own. The layout is a computed default (prepareOptions), the stylesheets load when it's built, and it renders once the window has loaded unless the caller says otherwise. It used to override whatever `autoRender` it was given.

- height: 100% and flex display are applied as inline styles, and the caller's style is laid over them
  - does a Page element have height: 100% applied at construction?
  - new Subject({ style: { height: "50vh" }, appendTo: document.body }) captures p -> p.elem.style.display === "flex" && p.elem.style.height === "50vh"
- a caller's `autoRender` is kept: `false` waits for render(), which loads the stylesheets then
  - new Subject({ autoRender: false, styleSheets: ["/lld-late.css"] }) captures p then document.querySelectorAll('link[href="/lld-late.css"]').length captures before then p.render() -> p.rendered === true && before === 0 && document.querySelectorAll('link[href="/lld-late.css"]').length === 1

## Its stylesheets sit ahead of the app's styles

A page renders after the window loads, by which time an app's bundled styles are already in the head. Appended after them, a stylesheet would win every tie of specificity against the app that overrides it; so the page's links go first in the head, in the order given.

- a stylesheet loaded at render comes before a style already in the head
  - document.head.append(Object.assign(document.createElement("style"), { id: "lld-app-style" })) captures s then new Subject({ styleSheets: ["/lld-first.css"], appendTo: document.body }) captures p -> Array.from(document.head.querySelectorAll("link[rel=stylesheet], style")).findIndex(n => n.getAttribute("href") === "/lld-first.css") < Array.from(document.head.querySelectorAll("link[rel=stylesheet], style")).findIndex(n => n.id === "lld-app-style")

## A stylesheet list tolerates gaps

Stylesheet lists are usually built by concatenating conditionals, so holes in them are normal rather than a mistake. A hole is skipped; the entries around it still load.

- falsy entries in `styleSheets` are skipped and the real entries beside them are still injected
  - new Subject({ styleSheets: [null, "/real.css", undefined, ""], appendTo: document.body }) captures p -> Array.from(document.querySelectorAll("link[rel=stylesheet]")).some(l => l.getAttribute("href") === "/real.css")

## An app can take over the bare elements

The page styles headings, links, code, form fields, buttons and tables wherever they appear. An app that styles its own elements turns that off with `themeElements: false` rather than resetting each one; the library's components keep their look, because the theme gives it to their own classes at no specificity.

- `themeElements: false` disables the bare-element styles, and `true` brings them back
  - new Array() captures seen then document.getElementById("vbc-theme-elements") captures style then new Subject({ themeElements: false, autoRender: true, appendTo: document.body }) captures page then style.disabled captures off then page.options.themeElements = true -> off === true && style.disabled === false
- a vbc-elements container keeps the element styles inside it while the page leaves them off
  - new Subject({ themeElements: false, autoRender: true, appendTo: document.body }) captures page then String(Array.from(document.querySelectorAll("style")).map(style => style.textContent).join("")).includes(":where(.vbc-elements)") captures scoped -> scoped === true

