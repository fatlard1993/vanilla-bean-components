# Router

Client-side router that maps paths to component classes, from the URL's hash by default or, with `mode: 'history'`, from its pathname. Each route pattern maps to a view class; the Router instantiates the matching view and destroys the previous one on navigation.

## Usage rules

The [usage rules](../../docs/USAGE_RULES.md) that bear on Router: [layout.page-once](../../docs/USAGE_RULES.md#page-shell-and-layout), [layout.view-shape](../../docs/USAGE_RULES.md#page-shell-and-layout), [layout.router-vs-tabs](../../docs/USAGE_RULES.md#page-shell-and-layout), [layout.route-paths](../../docs/USAGE_RULES.md#page-shell-and-layout), [layout.route-map](../../docs/USAGE_RULES.md#page-shell-and-layout), [action.link-navigates](../../docs/USAGE_RULES.md#actions-and-navigation).

## Usage

```js
import { Router, View, Page } from '@vanilla-bean/components';

class HomeView extends View {
	build() {
		// render view content here - no Page needed, the shell provides it
	}
}

class UserView extends View {
	build() {
		// route parameters from /users/:id are passed as options
		console.log(this.options.id);
	}
}

class NotFoundView extends View {
	build() {
		// 404 content
	}
}

// Page takes no title; the document's title is the browser's own
document.title = 'My App';

const page = new Page({ appendTo: document.body });

new Router({
	views: {
		'/': HomeView,
		'/users/:id': UserView,
	},
	// Every miss shows NotFoundView; with a defaultPath instead, a miss goes there
	defaultPath: null,
	notFound: NotFoundView,
	appendTo: page,
});
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `views` | `object` | - | **Required.** Maps route patterns to component classes. Patterns may contain `:param` segments. |
| `defaultPath` | `string` | First key of `views` | Route used when the hash is empty and for fallback on unmatched routes. |
| `notFound` | `typeof Component` | - | Component class rendered when no route matches and `defaultPath` fallback also fails. Receives `{ route }` as an option. |
| `onRenderView` | `Function` | - | Called with the matched route string whenever a new view is rendered. |
| `mode` | `'hash' \| 'history'` | `'hash'` | `'hash'` uses URL fragments (`#/path`). `'history'` uses `pushState` and real pathnames (`/path`). History mode requires the server to serve `index.html` for all routes. |

## Properties

```js
router.path; // string - the current path, '/users/42': the hash without its '#' and query string, or the pathname in history mode
router.path = '/users/42'; // navigate; sets window.location.hash and re-renders

router.route; // string - the matched route pattern for the current path (e.g. '/users/:id')
router.currentRoute; // string - the last successfully rendered route pattern
```

## Methods

```js
router.parseRouteParameters(path?: string): object
// Extracts named :param segments from a path.
// Defaults to the current path if none is provided.
// '/users/42' against '/users/:id' → { id: '42' }

router.pathToRoute(path: string): string
// Returns the matching route pattern for a path, or the path itself if no pattern matches.
```

## Route patterns

Routes are matched using exact string equality first, then segment by segment, a `:param` segment taking any one segment. Everything else in a pattern is literal (`/v1.2` matches only `/v1.2`). It's the matcher the server's `requestMatch` uses. When multiple parameterized patterns could match, routes with fewer `:param` segments are tested first, more specific patterns win without relying on object key order.

```js
views: {
  '/users/new':    NewUserView,   // exact match - always wins
  '/users/:id':    UserView,      // one param - tested before /:section/:id
  '/:section/:id': SectionView,   // two params - tested last
}
```

Query strings are stripped before matching: `#/users/42?sort=name` resolves to `/users/42`.

## Route parameters

Segments prefixed with `:` in the pattern are extracted, decoded (`#/tags/rock%20roll` gives `'rock roll'`), and passed as options to the rendered view class:

```js
views: { '/users/:id': UserView }

// Navigating to #/users/42 renders: new UserView({ id: '42', appendTo: this.elem })
class UserView extends View {
  build() {
    console.log(this.options.id); // '42'
  }
}
```

## Navigation behavior

- **Same-route navigation is a no-op.** Navigating to the already-active route does not destroy and rebuild the view. View state is preserved.
- **Empty hash** uses `defaultPath`. The hash is set and a re-render is triggered.
- **Unmatched routes** fall back to `defaultPath` first; `notFound` is the last resort, shown (with the path as `route`) only when there is no `defaultPath` view to go to. `defaultPath: null` makes every miss a `notFound`.
- The Router listens to both `popstate` and `hashchange`, and the browser back/forward buttons work without any extra setup.

## View base class

`View` is a styled `Component` exported alongside `Router`. It fills its container (`width: 100%; height: 100%; display: flex; flex-direction: column; flex: 1`) and is intended as the base class for route views, but is not required. Any `Component` subclass works as a view.

```js
import { Router, View } from '@vanilla-bean/components';

class SettingsView extends View {
	build() {
		/* ... */
	}
}
```

## Example - full SPA shell

```js
import { Component, Link, Page, Router, Toolbar, View } from '@vanilla-bean/components';

class HomeView extends View {
	build() {
		new Component({ textContent: 'Home content', appendTo: this });
	}
}

class ArticleView extends View {
	build() {
		new Component({ textContent: `Article: ${this.options.slug}`, appendTo: this });
	}
}

// Page is the app shell - Router and the nav bar live inside it, not inside each view
// Page takes no title; the document's title is the browser's own
document.title = 'My App';

const page = new Page({ appendTo: document.body });

const router = new Router({
	views: {
		'/': HomeView,
		'/articles/:slug': ArticleView,
	},
	defaultPath: '/',
	appendTo: page,
});

new Toolbar({
	variant: 'bar',
	prependTo: page,
	append: [
		new Link({ variant: 'flat', tooltip: false, textContent: 'Home', href: '#/' }),
		new Link({ variant: 'flat', tooltip: false, textContent: 'Latest', href: '#/articles/latest' }),
	],
});
```

The nav is Links, not Buttons that set `router.path`: going somewhere is a link, so it can open in a new tab and show where it goes, and the Router follows the hash it changes. `router.path =` is for navigating from code, after a save, say.
