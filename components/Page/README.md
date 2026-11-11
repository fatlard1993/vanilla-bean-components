# Page

The root of an app: one per app, holding the router so its views fill it. It is a full-height flex column, loads the library's stylesheets (Font Awesome and the Kode Mono font) and any you name, and renders once the window has loaded.

## Usage rules

The [usage rules](../../docs/USAGE_RULES.md) that bear on Page: [layout.page-once](../../docs/USAGE_RULES.md#page-shell-and-layout).

## Usage

```js
import { Page, Router } from '@vanilla-bean/components';

const router = new Router({ views, defaultPath: '/' });

new Page({ appendTo: document.body, append: router });
```

A second Page, or views appended beside the Page rather than inside it, is a mistake; an app shell with a bottom nav or a side rail goes inside the one Page.

## Stylesheets

Each stylesheet is added once, however many times a Page renders, as a `<link>` placed ahead of the app's own styles so the app wins a tie. An entry `{ href, scope }` is fetched instead and its rules confined under the `scope` selector. Empty entries are skipped, so a list built from conditionals needs no filtering.

The theme styles bare elements (headings, links, code, form fields, buttons, tables). An app that styles its own sets `themeElements: false`; the library's components keep their look either way.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `styleSheets` | `Array<string\|object>` | `[]` | More stylesheets: an href, or `{ href, scope, id }` to scope one under a selector |
| `themeElements` | `boolean` | `true` | `false` leaves bare elements to the app |
| `style` | `object` | - | Laid over the full-height flex column |
| `autoRender` | `string\|boolean` | `'onload'` | When it renders; `false` waits for `render()` |
