# vanilla-bean-components

A lightweight, reactive component library that brings modern frontend patterns to vanilla JavaScript without framework lock-in.

```js
import { Component, Context, styled } from 'vanilla-bean-components';

// Reactive state
const state = new Context({ count: 0 });

// Styled component
const Counter = styled(
	Component,
	({ colors }) => `
  display: flex;
  gap: 12px;
  padding: 16px;
  background: ${colors.dark(colors.gray)};
  border-radius: 6px;
`,
);

// Component with reactive options
new Counter({
	textContent: state.subscriber('count', count => `Count: ${count}`),
	append: [
		new Component({
			tag: 'button',
			textContent: 'Increment',
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

## Why vanilla-bean-components?

**Zero build steps.** Import directly in the browser or bundle with any tool. No CLI, no compilation, no framework-specific tooling required.

**Reactive by default.** State changes automatically update the UI using native browser APIs and proxies-no virtual DOM diffing needed.

**Options-first architecture.** Components configure through reactive options rather than method calls, making them naturally declarative and easier to compose.

**Built-in memory management.** Automatic cleanup prevents memory leaks without manual lifecycle management.

**Progressive complexity.** Start with simple HTML wrappers, add reactivity with Context, compose with styled components-use what you need.

Perfect for projects that want modern component patterns without framework overhead, or as a migration path from jQuery-style DOM manipulation to reactive patterns.

## Browser Compatibility

Requires modern browsers with ES6+ support (Proxy, Classes, Modules). Supports all evergreen browsers and Node.js 16+.

## Quick Start

Install:

```bash
bun install github:fatlard1993/vanilla-bean-components
```

Then import:

```js
import { Component } from 'vanilla-bean-components';
```

### Basic Component

Every component extends the native `EventTarget` and wraps an `HTMLElement`:

```js
import { Component } from 'vanilla-bean-components';

const button = new Component({
	tag: 'button',
	textContent: 'Click me',
	className: 'primary-btn',
	onPointerPress: () => alert('Hello!'),
	appendTo: document.body,
});
```

### Reactive State with Context

```js
import { Component, Context } from 'vanilla-bean-components';

const user = new Context({ name: 'Alice', online: false });

new Component({
	tag: 'div',
	textContent: user.subscriber('name', name => `Welcome, ${name}!`),
	className: user.subscriber('online', online => (online ? 'user-online' : 'user-offline')),
	appendTo: document.body,
});

// Updates automatically
user.name = 'Bob';
user.online = true;
```

### Styled Components

```js
import { Component, styled } from 'vanilla-bean-components';

const Card = styled(
	Component,
	({ colors }) => `
  background: ${colors.white};
  border-radius: 8px;
  box-shadow: 0 2px 8px ${colors.black.setAlpha(0.1)};
  padding: 24px;

  &:hover {
    transform: translateY(-2px);
    transition: transform 0.2s ease;
  }
`,
);

new Card({
	append: [
		new Component({ tag: 'h3', textContent: 'Card Title' }),
		new Component({ tag: 'p', textContent: 'Card content goes here.' }),
	],
	appendTo: document.body,
});
```

## Core Philosophy: Options Over Methods

Unlike traditional DOM libraries, vanilla-bean-components emphasizes **configuration over imperative calls**:

```js
// ❌ Traditional approach
const elem = createElement('div');
elem.classList.add('container');
elem.style.padding = '20px';
elem.textContent = 'Hello';
elem.addEventListener('click', handler);
document.body.appendChild(elem);

// ✅ Options-first approach
new Component({
	tag: 'div',
	addClass: 'container',
	style: { padding: '20px' },
	textContent: 'Hello',
	onPointerPress: handler,
	appendTo: document.body,
});
```

This pattern makes components naturally reactive-when options change, the component updates automatically.

## Architecture Overview

**[Component](./Component/README.md)** - Reactive wrapper around HTMLElement with automatic cleanup and lifecycle management

**[Context](./Context/README.md)** - Observable state containers that emit events on property changes

**[styled](./styled/README.md)** - Scoped CSS with theme integration and PostCSS processing

**[Theme](./theme/README.md)** - Colors, fonts, and component styles with accessibility helpers

**[Request](./request/README.md)** - HTTP client with intelligent caching and subscription system

All pieces work independently - use Component alone for enhanced DOM manipulation, or combine everything for full reactive applications.

## Component Library

24 pre-built components handle common UI patterns:

- **Forms**: `Input` (all HTML input types), `Select`, `Form`, `Label` with validation
- **Layout**: `Page`, `Router`, `List`, `Table`
- **Interaction**: `Button`, `Dialog`, `Menu`, `Popover`, `Tooltip`
- **Data**: `Calendar`, `ColorPicker`, `Keyboard`, `Whiteboard`
- **Content**: `Code`, `Icon`, `Link`, `TagList`

Each component documents its options, styling, and usage patterns in its own README.

## Real-World Example

```js
import { Component, Context, styled, GET } from 'vanilla-bean-components';

// Application state
const app = new Context({
	users: [],
	loading: false,
	selectedUserId: null,
});

// Styled components
const UserCard = styled(
	Component,
	({ colors }) => `
  padding: 16px;
  border: 1px solid ${colors.light(colors.gray)};
  border-radius: 6px;
  cursor: pointer;

  &:hover { background: ${colors.lightest(colors.blue)}; }
  &.selected { border-color: ${colors.blue}; }
`,
);

const LoadingSpinner = styled(
	Component,
	() => `
  display: inline-block;
  animation: spin 1s linear infinite;

  @keyframes spin { to { transform: rotate(360deg); } }
`,
);

// Load data with automatic UI updates
async function loadUsers() {
	app.loading = true;

	const { body: users } = await GET('/api/users', {
		onRefetch: ({ body }) => (app.users = body), // Auto-refresh on cache invalidation
	});

	app.users = users;
	app.loading = false;
}

// User list component
new Component({
	tag: 'div',
	className: 'user-list',

	// Conditional rendering based on loading state
	content: app.subscriber('loading', loading =>
		loading
			? new LoadingSpinner({ textContent: 'Loading...' })
			: app.subscriber('users', users =>
					users.map(
						user =>
							new UserCard({
								textContent: user.name,
								className: app.subscriber('selectedUserId', selectedId => (selectedId === user.id ? 'selected' : '')),
								onPointerPress: () => (app.selectedUserId = user.id),
							}),
					),
				),
	),

	appendTo: document.body,
});

loadUsers();
```

## Getting Started

1. **[Installation & Setup](./docs/GETTING_STARTED.md)** - Project structure and build integration
2. **[Core Concepts](./Elem/README.md)** - Start with Elem for enhanced DOM manipulation
3. **[Adding Reactivity](./Component/README.md)** - Component lifecycle and reactive options
4. **[State Management](./Context/README.md)** - Context for observable state
5. **[Styling Guide](./styled/README.md)** - Scoped CSS and theme system

## Examples & Demo

Explore the [demo app](./demo/README.md) (`bun start`) for:

- **Component demos** - Every component with interactive examples
- **Real applications** - Todo lists, calculators, drawing apps
- **Integration patterns** - Forms, data tables, multi-widget dashboards

Each example includes source code and demonstrates different architectural approaches.

---

**[Browse Components](./components/)** • **[API Documentation](./docs/)** • **[Live Demo](./demo/)**
