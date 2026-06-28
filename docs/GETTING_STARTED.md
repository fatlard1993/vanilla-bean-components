# Getting Started

This guide walks you through setting up @vanilla-bean/components from scratch and building your first reactive application.

## Installation

```bash
# Using npm
npm install @vanilla-bean/components

# Using Bun
bun add @vanilla-bean/components
```

## Basic HTML Setup

Create an `index.html` file:

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>My App</title>
		<script type="module" src="./main.js"></script>
	</head>
	<body></body>
</html>
```

## Your First Component

> **Explore alongside this guide**: `bun start` launches the component explorer at `localhost:9999`. Every component has a live option editor, change any option and watch it update. The same component you're reading about, live.

When data changes in VBC, **you** decide what updates, through explicit handlers you write. No reconciliation loop. No dependency graph. No magic.

> This guide uses `Oxject` for reactive state (included in VBC, no separate install) and `hypertether` for data fetching (`bun add @vanilla-bean/hypertether`).

Create `main.js`:

```js
import { Component, Oxject } from '@vanilla-bean/components';

// Create reactive state
const state = new Oxject({
	count: 0,
	message: 'Hello, World!',
});

// Create a simple counter component
const counter = new Component({
	tag: 'div',
	style: {
		padding: '20px',
		textAlign: 'center',
		fontFamily: 'system-ui',
	},
	append: [
		new Component({
			tag: 'h1',
			textContent: state.subscriber('message'),
		}),
		new Component({
			tag: 'p',
			textContent: state.subscriber('count', count => `Count: ${count}`),
			style: { fontSize: '24px', margin: '20px 0' },
		}),
		new Component({
			tag: 'button',
			textContent: 'Increment',
			style: {
				padding: '10px 20px',
				fontSize: '16px',
				marginRight: '10px',
			},
			onPointerPress: () => state.count++,
		}),
		new Component({
			tag: 'button',
			textContent: 'Reset',
			onPointerPress: () => (state.count = 0),
		}),
	],
	appendTo: document.body,
});
```

## Understanding the Basics

### Components

Components wrap HTML elements with reactive capabilities:

```js
const myComponent = new Component({
	tag: 'div', // HTML element type
	textContent: 'Hello', // Properties set directly on element
	className: 'my-class', // Standard HTML attributes
	onPointerPress: () => {}, // Event handlers
	style: {
		// Inline styles as object
		color: 'blue',
		padding: '10px',
	},
	append: [child1, child2], // Child elements
	appendTo: document.body, // Where to render
});
```

### Reactive State with Oxject

`component.options` is already an Oxject instance. Any component's `options.subscriber()` and `options.subscribe()` are available on every component automatically. Import `Oxject` from `'@vanilla-bean/components'` when you need your own state containers that live outside a single component.

`Oxject` holds observable state. When a property changes, any subscriber that declared a transformation for that property runs that transformation, explicitly, exactly as you wrote it:

```js
import { Oxject } from '@vanilla-bean/components';

const state = new Oxject({
	user: { name: 'John', email: 'john@example.com' },
	isLoggedIn: false,
	notifications: [],
});

// You declare the transformation — this function runs when 'user' changes, nothing else
const greeting = state.subscriber('user', user => `Welcome, ${user.name}!`);

// Assign to state — triggers only the subscribers you registered for this key
state.user = { name: 'Alice', email: 'alice@example.com' };
```

The subscriber is not a magic dependency tracker. It's a named transformation: "when `user` changes, produce this value." You wrote it. There's no framework inferring what depends on what.

### Reactive updates — layered by complexity

VBC offers several approaches for wiring data to DOM, in order of simplicity. Reach for the simplest one that expresses what you need.

**1. Subscriber as option value**: for pure transformations, no component subclass needed:

```js
const state = new Oxject({ count: 0, loading: false });

new Component({
	textContent: state.subscriber('count', n => `${n} items`),
	className: state.subscriber('loading', l => (l ? 'loading' : '')),
	appendTo: document.body,
});

state.count++; // textContent updates
state.loading = true; // className updates
```

**2. Subscriber in `content`**: for list or structural updates, declared in `build()` next to the structure it updates:

```js
export default class UserList extends Component {
	build() {
		this.list = new Component({
			tag: 'ul',
			appendTo: this,
			content: this.options.subscriber('users', users =>
				(users || []).map(u => new Elem({ tag: 'li', textContent: u.name })),
			),
		});
	}
}

const list = new UserList({ appendTo: document.body });
list.options.users = fetchedUsers; // list rebuilds
```

`content` with an array calls `replaceChildren()`, clears and replaces in one shot.

**3. `static handlers`**: for multiple keys or class management. Component walks the constructor chain checking for handlers before standard routing, unhandled keys fall through automatically, no `super._setOption` required. Use shorthand methods so `this` is correctly bound to the component instance:

```js
class Card extends Component {
	build() {
		this.header = new Component({ tag: 'header', appendTo: this });
		this.body = new Component({ tag: 'section', appendTo: this });
	}

	static handlers = {
		title(value) {
			this.header.options.textContent = value;
		},
		variant(value) {
			this.removeClass(/variant-\S+/).addClass(`variant-${value}`);
		},
		content(value) {
			this.body.options.content = value;
		},
	};
}
```

Static handlers compose across inheritance. A subclass's `static handlers` adds to the parent's without shadowing it.

**4. `this.options.subscribe()` in `build()`**: when the update needs to coordinate multiple things:

```js
build() {
    this.count = new Elem({ tag: 'span', appendTo: this });
    this.list  = new Component({ tag: 'ul', appendTo: this });

    const { unsubscribe } = this.options.subscribe({
        key: 'users',
        callback: users => {
            this.count.options.textContent = `${(users || []).length} users`;
            this.list.options.content = (users || []).map(u => new Elem({ tag: 'li', textContent: u.name }));
        },
    });
    this.addCleanup('users', unsubscribe);
}
```

**5. `_setOption` override**: for enum validation that throws, or logic that must intercept before the standard routing chain:

```js
_setOption(key, value) {
    if (key === 'users') {
        this._renderUsers(value);
    } else {
        super._setOption(key, value); // always call super for unrecognized keys
    }
}

_renderUsers(users) { /* ... */ }
```

Most cases don't reach 5. Subscribers handle simple reactive updates. `handlers` covers moderate complexity without the `super._setOption` footgun. `_setOption` override is for validation and edge cases that need the full routing chain.

## The intended model — three tiers

VBC is structured in three tiers, each building on the one below:

**Primitives**: `Elem`, `Component`, `Oxject`, `styled`. The reactive core. All four come with VBC. Add `hypertether` (`bun add @vanilla-bean/hypertether`) for HTTP caching, it's the only one that's a separate install.

**Components**: `Button`, `Dialog`, `Table`, `Form`, `Calendar`, etc. A second tier of building blocks that handle real, cross-cutting concerns: keyboard activation, focus management, accessibility, form validation, modal behavior, data rendering. These aren't examples. They're production-quality composed primitives you use directly when they fit your needs.

**Your app layer**: domain-specific components built on the two tiers above, colocated with your app code, specific to your product.

The intended way to use VBC in an application is to build that third tier. Your app's `FieldList`, `AnimalPanel`, `SeasonChart`, built on the primitives for structure and reactivity, reaching into the component tier for concerns those components handle well.

```js
// Your app's component — not a generic one from the library
import { Component, Elem, styled } from '@vanilla-bean/components';
import { getFields, updateField } from '../api';

const FieldCard = styled(
	Component,
	({ colors }) => `
    padding: 12px 16px;
    border: 1px solid ${colors.dark(colors.gray)};
    border-radius: 8px;
    cursor: pointer;
    &:hover { border-color: ${colors.light(colors.gray)}; }
`,
);

export default class FieldList extends Component {
	build() {
		this.list = new Component({
			tag: 'ul',
			appendTo: this,
			content: this.options.subscriber('fields', fields =>
				(fields || []).map(
					field =>
						new FieldCard({
							textContent: field.name,
							onPointerPress: () => this._select(field),
						}),
				),
			),
		});
		this._loadData();
	}

	async _loadData() {
		const { body: fields } = await getFields();
		this.options.fields = Object.values(fields);
	}

	_select(field) {
		/* ... */
	}
}
```

This component is yours. It lives in your codebase, knows your domain, uses your API, and follows your conventions. The library provides the primitives it's built on.

**Fork-ability is a feature.** At some point a large enough product will have requirements that reach the primitive layer itself, not just building on top, but needing the foundation to behave differently. That's when you clone the whole repository and own it.

The three tiers are designed to defer that point. Most projects build very far before anything reaches the primitives. But the fork is viable by design. It uses plain JavaScript, consistent patterns, no compiled output. You can read it, understand it, and modify it. A library you can fork is a library you can trust.

## Working with Forms

Create a contact form with validation:

```js
import { Form, Button, Select } from '@vanilla-bean/components';

const contactForm = new Form({
	data: {
		name: '',
		email: '',
		subject: 'general',
		message: '',
	},
	inputs: [
		{
			key: 'name',
			label: 'Full Name',
			validations: [
				[/.+/, 'Name is required'],
				[/^.{2,50}$/, 'Name must be 2-50 characters'],
			],
		},
		{
			key: 'email',
			label: 'Email Address',
			type: 'email',
			validations: [[/.+@.+\..+/, 'Valid email required']],
		},
		{
			key: 'subject',
			label: 'Subject',
			InputComponent: Select,
			options: ['general', 'support', 'billing', 'feature-request'],
		},
		{
			key: 'message',
			label: 'Message',
			tag: 'textarea',
			validations: [[/.{10,}/, 'Message must be at least 10 characters']],
		},
	],
	append: new Button({
		textContent: 'Send Message',
		onPointerPress: () => {
			if (contactForm.hasErrors()) {
				console.log('Form has validation errors');
				return;
			}

			console.log('Form data:', contactForm.options.data);
			// Submit form data...
		},
	}),
	appendTo: document.body,
});
```

## Async Data and Components

Components render synchronously. Data flows in after the initial render via `options`, the reactive hydration layer. Structure goes in `build()`, reactive updates wire through subscribers declared alongside that structure.

```js
import { Component, Elem } from '@vanilla-bean/components';
import { GET } from '@vanilla-bean/hypertether';

class UserList extends Component {
	build() {
		// Subscriber declared next to the structure it updates
		this.list = new Component({
			tag: 'ul',
			appendTo: this,
			content: this.options.subscriber('users', users =>
				(users || []).map(u => new Elem({ tag: 'li', textContent: u.name })),
			),
		});
	}
}

const userList = new UserList({ appendTo: document.body });

// Data arrives after render — push in via options, subscriber fires
const { body } = await GET('/api/users');
userList.options.users = body;
```

For live-updating data, wire `onResponse` to the same option:

```js
const { body } = await GET('/api/users', {
	apiId: 'users',
	onResponse: ({ body }) => {
		userList.options.users = body;
	},
});
userList.options.users = body;
```

When a POST invalidates `'users'`, `onResponse` runs and the list rebuilds, no re-render, no `_setOption` override needed.

## HTTP Requests with Caching

[hypertether](https://github.com/fatlard1993/hypertether) is the companion HTTP layer. It handles the full data lifecycle: fetch, cache, invalidate, and refetch. When a mutation declares `invalidates: ['users']`, every subscriber that registered `onResponse` receives fresh data, no global store, no pub/sub setup required.

```js
import { GET, POST } from '@vanilla-bean/hypertether';

// Cached GET — onResponse fires whenever 'users' is invalidated
const { body: users } = await GET('/api/users', {
	apiId: 'users',
	onResponse: ({ body }) => {
		updateUserList(body);
	},
});

// Mutation that invalidates the cache and triggers all onResponse callbacks for 'users'
await POST('/api/users', {
	body: { name: 'New User', email: 'user@example.com' },
	invalidates: ['users'],
});
```

## Styling and Theming

### Using the Theme System

```js
import { Component, styled } from '@vanilla-bean/components';

const ThemedButton = styled(
	Component,
	({ colors, fonts }) => `
    ${fonts.kodeMono}
    background: ${colors.blue};
    color: ${colors.mostReadable(colors.blue, [colors.white, colors.black])};
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    cursor: pointer;

    &:hover {
        background: ${colors.dark(colors.blue)};
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }
`,
);
```

### Template Literal Syntax

```js
const StyledCard = styled.Component`
	background: ${({ colors }) => colors.darker(colors.gray)};
	border-radius: 8px;
	padding: 20px;
	box-shadow: 0 4px 12px ${({ colors }) => colors.black.setAlpha(0.2)};

	h2 {
		color: ${({ colors }) => colors.light(colors.blue)};
		margin-top: 0;
	}
`;
```

## Next Steps

1. **Run the component explorer**: `bun start` from the repo root. Every component has a live option editor, showing type, default, and current value for every option, editable in real time. The explorer itself is built with VBC; reading `demo/` shows how the primitives compose at scale.

2. **Build your first app component**: Subclass `Component` with `build()` and wire reactive updates via subscribers or `this.options.subscribe()`. Start simple. Reach for `_setOption` only when coordination complexity demands it.

3. **Read the architecture**: The [architecture overview](./ARCHITECTURE.md) explains the three-layer mental model, structure in `build()`, data through `options`, updates via subscribers, and the async hydration pattern.

4. **Add reactive state**: `Oxject` is included in VBC. Import it with `import { Oxject } from '@vanilla-bean/components'`. `new Oxject({ count: 0 })` gives you a reactive state container; pass `state.subscriber('count', n => ...)` as any component option value and it updates automatically.

5. **Use the component tier**: `/components/` contains `Button`, `Dialog`, `Table`, `Form`, etc. These handle real concerns. Use them when they fit rather than rebuilding that layer. Reading their source also shows how the primitives compose at scale.

6. **Master styling**: The [styled system documentation](../styled/README.md) covers theme integration, native CSS nesting, and scoped CSS patterns.

7. **HTTP and caching**: [hypertether](https://github.com/fatlard1993/hypertether) is the companion HTTP layer, handling caching, subscriptions, and cache invalidation. Wire API responses into component options via `onResponse`.

8. **Fork when your needs reach the foundation**: If requirements eventually penetrate to the primitive layer itself, not just building on top but needing the primitives to behave differently, clone the repository and own it. The source is plain JavaScript following explicit patterns; it's genuinely maintainable. Most projects build very far before that point arrives.
