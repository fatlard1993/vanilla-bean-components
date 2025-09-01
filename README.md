# vanilla-bean-components

A lightweight, reactive component library for building modern web applications with vanilla JavaScript. No build steps, no framework lock-in, no virtual DOM complexity.

## Key Features

- **Zero build requirements** - Import directly in browsers or bundle with any tool
- **Reactive state management** - Automatic UI updates using native Proxy APIs
- **Scoped CSS styling** - Theme-integrated styles with PostCSS processing
- **Memory-safe components** - Automatic cleanup prevents memory leaks
- **Progressive adoption** - Use individual pieces or complete reactive architecture
- **24 pre-built components** - Forms, layouts, interactions, and data visualization
- **Modern browser APIs** - EventTarget, Proxy, ES6 modules, Web Components compatible

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Architecture](#core-architecture)
- [Component Library](#component-library)
- [Real-World Example](#real-world-example)
- [Browser Compatibility](#browser-compatibility)
- [Development](#development)
- [Contributing](#contributing)

## Installation

Install from GitHub:

```bash
# Using bun
bun install github:fatlard1993/vanilla-bean-components

# Using npm
npm install github:fatlard1993/vanilla-bean-components

# Using yarn
yarn add github:fatlard1993/vanilla-bean-components
```

Import in your application:

```js
// Individual imports
import { Component, Context, styled } from 'vanilla-bean-components';

// Specific components
import { Button, Dialog, Calendar } from 'vanilla-bean-components';
```

## Quick Start

### Basic Component Creation

Every component extends `EventTarget` and wraps an `HTMLElement`:

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

### Reactive State Management

State changes automatically update connected UI elements:

```js
import { Component, Context } from 'vanilla-bean-components';

const user = new Context({ name: 'Alice', online: false });

new Component({
	tag: 'div',
	textContent: user.subscriber('name', name => `Welcome, ${name}!`),
	className: user.subscriber('online', online => (online ? 'user-online' : 'user-offline')),
	appendTo: document.body,
});

// UI updates automatically
user.name = 'Bob';
user.online = true;
```

### Styled Components with Theme Integration

Create scoped, themed components:

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

### Complete Reactive Application

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

## Core Architecture

### Options-First Design Philosophy

Components configure through reactive options rather than imperative method calls:

```js
// ❌ Traditional DOM manipulation
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

This pattern enables automatic reactivity - when options change, components update automatically.

### Core Modules

| Module | Purpose | Key Features |
| --- | --- | --- |
| **[Component](./Component/README.md)** | Enhanced DOM elements | Lifecycle management, reactive options, automatic cleanup |
| **[Context](./Context/README.md)** | Observable state | Proxy-based reactivity, subscription system, event emission |
| **[styled](./styled/README.md)** | Scoped CSS | Theme integration, PostCSS processing, unique class generation |
| **[Theme](./theme/README.md)** | Design system | Color manipulation, font management, accessibility helpers |
| **[Request](./request/README.md)** | HTTP client | Intelligent caching, cache invalidation, subscription-based updates |

All modules work independently. Use `Component` alone for enhanced DOM manipulation, or combine for complete reactive applications.

## Component Library

24 pre-built components handle common UI patterns:

### Forms & Input

- **Input** - All HTML input types with validation
- **Select** - Dropdown selections with search
- **Form** - Form management with validation
- **Label** - Associated labels with accessibility

### Layout & Structure

- **Page** - Full-page layouts with header/footer
- **Router** - Client-side navigation
- **List** - Dynamic lists with filtering
- **Table** - Data tables with sorting

### Interactive Elements

- **Button** - Action buttons with states
- **Dialog** - Modal dialogs with backdrop
- **Menu** - Context and dropdown menus
- **Popover** - Floating content containers
- **Tooltip** - Contextual help and information

### Specialized Components

- **Calendar** - Date selection with events
- **ColorPicker** - Color selection interface
- **Keyboard** - Virtual keyboard input
- **Whiteboard** - Drawing and annotation canvas

### Content & Display

- **Code** - Syntax-highlighted code blocks
- **Icon** - Icon system with Font Awesome integration
- **Link** - Enhanced anchor elements
- **TagList** - Tag management and display

Each component includes comprehensive documentation, styling options, and usage examples.

## Real-World Example

Complete user management interface with data loading and state management:

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

// Data loading with automatic UI updates
async function loadUsers() {
	app.loading = true;

	const { body: users } = await GET('/api/users', {
		onRefetch: ({ body }) => (app.users = body), // Auto-refresh on cache invalidation
	});

	app.users = users;
	app.loading = false;
}

// User list with conditional rendering
new Component({
	className: 'user-list',
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

## Browser Compatibility

**Modern browsers only** - Requires ES6+ support including:

- Proxy objects for reactive state
- ES6 classes and modules
- EventTarget interface
- Modern DOM APIs

**Supported environments:**

- Chrome/Edge 49+
- Firefox 18+
- Safari 10+
- Node.js 16+

No polyfills provided. Use transpilation for legacy browser support if needed.

## Development

### Local Development

```bash
# Clone and install
git clone https://github.com/fatlard1993/vanilla-bean-components
cd vanilla-bean-components
bun install

# Start demo server
bun start        # Development server at http://localhost:3000

# Run tests
bun test         # Full test suite
bun test:watch   # Watch mode for development

# Build and validation
bun run build    # Clean build with component indexing
bun run lint     # ESLint validation
bun run format   # Code formatting with Prettier
```

### Project Structure

```
vanilla-bean-components/
├── components/           # 24 pre-built UI components
├── Component/           # Core Component class
├── Context/            # Reactive state management
├── styled/             # Scoped styling system
├── theme/              # Design tokens and helpers
├── request/            # HTTP client with caching
├── demo/               # Interactive examples and documentation
└── docs/               # Additional documentation
```

### Creating Components

Generate new components with full scaffolding:

```bash
bun run create:component MyComponent
```

This creates implementation, demo, tests, and documentation files following project patterns.

## Contributing

1. **Fork and clone** the repository
2. **Create feature branch** from `main`
3. **Follow existing patterns** - Check similar components for code style
4. **Add comprehensive tests** - Use `@testing-library/dom` patterns
5. **Update documentation** - Include README updates and demos
6. **Run validation** - `bun run lint && bun test` before submitting

See individual component READMEs for architecture patterns and implementation guidelines.

## License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**[Browse Components](./components/)** • **[API Documentation](./docs/)** • **[Live Demo](./demo/)** • **[Getting Started Guide](./docs/GETTING_STARTED.md)**
