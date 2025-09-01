# Vanilla Bean Components: Complete AI Implementation Guide

## Library Architecture & Philosophy

Vanilla Bean Components is a reactive component library built on **options-first architecture** - components are configured through reactive options rather than imperative method calls. This fundamental design enables automatic DOM updates when state changes, using native browser APIs and Proxy objects.

### Core Principles

- **Zero build requirements** - Import directly in browser or bundle with any tool
- **Reactive by default** - Options changes trigger DOM updates automatically
- **Progressive complexity** - Use simple HTML wrappers or full reactive applications
- **Automatic memory management** - Components self-cleanup on DOM disconnect
- **Native performance** - No virtual DOM; direct browser API usage

### Browser Compatibility

Requires modern browsers with ES6+ support (Proxy, Classes, Modules). Supports all evergreen browsers and Node.js 16+.

## Core Architecture: Component Hierarchy

```
Component (reactive options via Context, lifecycle, cleanup)
├── extends Elem (DOM manipulation, method chaining)
│   └── extends EventTarget (native events)
└── integrates Context (reactive state management via Proxy)
```

## 1. Elem - Enhanced DOM Foundation (Non-Reactive)

Elem is the foundation layer providing enhanced DOM operations with method chaining. **Elem is NOT reactive** - it processes options once during construction.

```js
import { Elem } from 'vanilla-bean-components';

// Static options - changes do NOT trigger DOM updates
const elem = new Elem({
	tag: 'button', // HTML tag to create
	textContent: 'Click me', // Set elem.textContent
	className: 'btn primary', // Set elem.className
	onclick: () => alert('clicked'), // Set elem.onclick
})
	.addClass('active') // Method chaining works
	.setStyle({ padding: '12px' }) // Fluent API
	.appendTo(document.body);

// Changes after creation require direct methods (not options)
elem.textContent = 'Updated'; // Direct property assignment
elem.addClass('new-class'); // Or use methods
// elem.options.textContent = 'Updated'; // Does NOTHING (not reactive)
```

### Elem Method Patterns

```js
// Class manipulation (supports arrays and regex)
elem.addClass('class1', 'class2', ['class3', 'class4']);
elem.removeClass('class1', /^temp-/); // Regex removes temp-* classes
elem.hasClass('active', /^btn-/);

// Content manipulation (arrays flattened recursively)
elem.content('text'); // Set text content
elem.content(otherElem); // Set element content
elem.append(child1, child2, [child3]); // Append children (flattens arrays)

// Styling and attributes
elem.setStyle({ color: 'red', fontSize: '16px' });
elem.setAttributes({ 'data-id': '123', role: 'button' });

// Hierarchy
elem.appendTo(parent); // Append this to parent
elem.prependTo(parent); // Prepend this to parent
```

## 2. Component - Reactive Options System (Core Difference)

**Critical Understanding**: Component extends Elem but replaces the static options object with a reactive Context instance. This Context uses Proxy to intercept property changes and emit events, triggering DOM updates.

```js
import { Component, Context } from 'vanilla-bean-components';

// Component options are REACTIVE (backed by Context)
const comp = new Component({
	tag: 'div',
	textContent: 'Initial', // Processed via _setOption
	className: 'dynamic', // DOM updates automatically
	onPointerPress: () => alert('clicked'), // Event handler registration
});

// Changes to options trigger DOM updates automatically
comp.options.textContent = 'Updated'; // DOM updates immediately!
comp.options.className = 'new-style'; // CSS classes update!
```

### Component vs Elem - Critical Difference

```js
// Elem: Options processed once during construction
const elem = new Elem({ textContent: 'Static' });
elem.options.textContent = 'Changed'; // NO effect on DOM

// Component: Options are reactive Context properties
const comp = new Component({ textContent: 'Dynamic' });
comp.options.textContent = 'Changed'; // DOM updates automatically!
```

### Component Option Processing Pipeline

Component processes all options through the `_setOption(key, value)` method:

```js
_setOption(key, value) {
  // 1. Event handlers (keys starting with 'on')
  if (key.startsWith('on') && value) {
    const targetEvent = key.replace(/^on/, '').toLowerCase();
    this.on({ targetEvent, callback: value });
    return;
  }

  // 2. Special Component options
  if (key === 'style') this.setStyle(value);
  else if (key === 'attributes') this.setAttributes(value);
  else if (key === 'styles') this.styles(value); // Theme function or object

  // 3. Known HTML attributes
  else if (this.__knownAttributes.has(key) || key.startsWith('aria-')) {
    this.elem.setAttribute(key, value);
  }

  // 4. Component methods (if method exists on Component)
  else if (typeof this[key] === 'function') this[key].call(this, value);

  // 5. Component properties (if property exists on Component)
  else if (this.hasOwnProperty(key)) this[key] = value;

  // 6. HTMLElement methods
  else if (typeof this.elem[key] === 'function') {
    if (value?.elem) value = value.elem; // Unwrap nested Components
    this.elem[key].call(this.elem, value);
  }

  // 7. HTMLElement properties (fallback)
  else this.elem[key] = value;
}
```

### Enhanced Event Handling Features

**Input Event Enhancement** - Component automatically adds `.value` property:

```js
new Component({
	tag: 'input',
	type: 'text',
	onChange: event => {
		// event.value automatically added based on input type:
		console.log(event.value); // For text: event.target.value
		// For checkbox: event.target.checked
		// For select: selected option value
	},
});
```

**DOM Connection Events** - Via MutationObserver:

```js
new Component({
	tag: 'div',
	onConnected: () => console.log('Added to DOM'),
	onDisconnected: () => console.log('Removed from DOM - cleanup triggered'),
});
```

## 3. Context - Observable State Container (Proxy-Based)

Context is the reactive foundation using Proxy to intercept property access and emit events on changes:

```js
import { Context } from 'vanilla-bean-components';

// Create reactive state - RETURNS A PROXY
const user = new Context({
	name: 'Alice',
	email: 'alice@example.com',
	preferences: { theme: 'dark', notifications: true },
});

// Direct property access triggers reactivity via Proxy
user.name = 'Bob'; // Emits 'name' event and 'set' event

// Event-based subscriptions
user.addEventListener('name', ({ detail }) => {
	console.log('Name changed to:', detail); // 'Bob'
});

// Generic change listener
user.addEventListener('set', ({ detail: { key, value } }) => {
	console.log(`${key} changed to:`, value);
});
```

### Context Event System

- **'set' event**: Emitted for every property change with `{ key, value }`
- **'{propertyName}' event**: Emitted for specific property with `value` as detail
- Both events fire automatically via Proxy setter intercepts

### Manual Subscriptions with Parsing

```js
const { unsubscribe, current } = user.subscribe({
	key: 'name',
	callback: name => updateUI(name),
	parser: name => name.toUpperCase(), // Transform value before callback
});

console.log(current); // 'ALICE' (parsed initial value)
user.name = 'Charlie'; // Callback receives 'CHARLIE'
unsubscribe(); // Cleanup
```

## 4. Subscribers - Reactive Value Transformation

Subscribers provide **transparent Proxy access** to transformed Context values:

```js
// Single property with transformation
const greeting = user.subscriber('name', name => `Hello, ${name}!`);

// Subscriber Proxy provides transparent access to current parsed value
console.log(greeting.toString()); // "Hello, Alice!"
console.log(greeting.length); // 13 (length of transformed string)
greeting.slice(0, 5); // "Hello" (string methods work)

// Automatic updates when Context changes
user.name = 'Bob';
console.log(greeting.toString()); // "Hello, Bob!" (automatic update)
```

### Subscriber Proxy Behavior

- **Property access**: Delegated to current parsed value
- **Method calls**: Called on current parsed value with correct `this` binding
- **Subscriber methods**: Direct access (`subscribe`, `unsubscribe`, `toJSON`)
- **Updates**: Automatic when source Context property changes

### MetaSubscriber - Multiple Properties

```js
import { MetaSubscriber } from 'vanilla-bean-components';

const fullProfile = new MetaSubscriber(
	{ context: user, key: 'name' },
	{ context: user, key: 'email' },
	(name, email) => `${name} <${email}>`, // Combiner function
);

console.log(fullProfile.toString()); // "Alice <alice@example.com>"
user.name = 'Bob'; // fullProfile automatically updates to "Bob <alice@example.com>"

// With individual parsers and debouncing
const formatted = new MetaSubscriber(
	{ context: user, key: 'name', parser: name => name.toUpperCase() },
	{ context: user, key: 'email', parser: email => email.toLowerCase() },
	(name, email) => `${name} [${email}]`,
	{ debounceMs: 100 }, // Debounce rapid changes
);
```

## 5. Cross-Context Reactivity Patterns

### Pattern 1: Direct Subscriber Embedding

```js
const app = new Context({ currentUser: null });
const ui = new Context({
	// Embed subscribers directly in state
	welcomeMessage: app.subscriber('currentUser', user => (user ? `Welcome, ${user.name}!` : 'Please log in')),
	isLoggedIn: app.subscriber('currentUser', user => !!user),
});

app.currentUser = { name: 'Alice' };
// ui.welcomeMessage automatically becomes "Welcome, Alice!"
// ui.isLoggedIn automatically becomes true
```

### Pattern 2: Manual Cross-Context Subscriptions

```js
const app = new Context({ currentUser: null });
const ui = new Context({ welcomeMessage: '', isLoggedIn: false });

app.subscribe({
	key: 'currentUser',
	callback: user => {
		ui.welcomeMessage = user ? `Welcome, ${user.name}!` : 'Please log in';
		ui.isLoggedIn = !!user;
	},
});
```

### Pattern 3: Derived State Factory

```js
const createDerivedContext = (sourceContext, derivations) => {
	const derived = new Context({});

	Object.entries(derivations).forEach(([key, { sourceKey, parser }]) => {
		derived[key] = sourceContext.subscriber(sourceKey, parser);
	});

	return derived;
};

const derivedUI = createDerivedContext(app, {
	greeting: { sourceKey: 'currentUser', parser: user => user?.name || 'Guest' },
	avatar: { sourceKey: 'currentUser', parser: user => user?.avatar || '/default.png' },
});
```

## 6. Advanced Component Patterns

### Pattern 1: Basic Extension with Option Defaults

```js
class Button extends Component {
	constructor(options = {}, ...children) {
		super(
			{
				tag: 'button',
				className: 'btn',
				role: 'button',
				...options, // User options override defaults
			},
			...children,
		);
	}
}
```

### Pattern 2: Custom Option Processing

```js
class Toggle extends Component {
	constructor(options = {}) {
		super(options);
		this.state = new Context({ checked: options.checked || false });
	}

	_setOption(key, value) {
		if (key === 'checked') {
			this.state.checked = value;
			this.elem.setAttribute('aria-checked', value);
		} else if (key === 'variant') {
			this.removeClass(/\\bvariant-\\S+/g).addClass(`variant-${value}`);
		} else {
			super._setOption(key, value);
		}
	}

	get checked() {
		return this.state.checked;
	}
	set checked(value) {
		this.options.checked = value;
	} // Triggers _setOption
}
```

### Pattern 3: Internal Reactive State

```js
class Counter extends Component {
	constructor(options = {}) {
		// Create internal state
		const state = new Context({
			count: options.initialCount || 0,
			step: options.step || 1,
		});

		super({
			tag: 'div',
			className: 'counter',
			textContent: state.subscriber('count', count => `Count: ${count}`),
			onPointerPress: () => (state.count += state.step),
			...options,
		});

		this.state = state; // Expose for external access
	}

	increment() {
		this.state.count += this.state.step;
	}
	decrement() {
		this.state.count -= this.state.step;
	}
	reset() {
		this.state.count = 0;
	}
}

// Usage
const counter = new Counter({ step: 5 });
counter.appendTo(document.body);
counter.increment(); // Programmatic control
```

## 7. Styled Components with Scoped CSS

The styling system automatically generates unique class names and processes CSS through PostCSS:

```js
import { styled, theme } from 'vanilla-bean-components';

// Function syntax with theme integration and default options
const StyledButton = styled(
	Component, // Base component class
	({ colors, fonts }) => `
		${fonts.kodeMono} /* Apply font stack */
		background: ${colors.blue};
		color: ${colors.white};
		padding: 12px 24px;
		border: none;
		border-radius: 6px;
		cursor: pointer;

		&:hover {
			background: ${colors.darker(colors.blue)};
			transform: translateY(-1px);
		}

		&.variant-secondary {
			background: ${colors.gray};
			color: ${colors.black};
		}
	`,
	{ tag: 'button', role: 'button' }, // Default component options
);

// Template literal syntax (no default options)
const StyledCard = styled.Component`
	background: ${({ colors }) => colors.darker(colors.gray)};
	border: 1px solid ${({ colors }) => colors.darkest(colors.gray)};
	border-radius: 8px;
	padding: 16px;

	&:hover {
		border-color: ${({ colors }) => colors.blue};
	}
`;
```

### Runtime Style Overrides

```js
// Object styles (inline CSS)
const dynamicButton = new StyledButton({
	textContent: 'Dynamic',
	styles: {
		backgroundColor: 'red',
		border: '2px solid darkred',
	},
});

// Function styles (scoped CSS)
const themedButton = new StyledButton({
	textContent: 'Themed',
	styles: ({ colors }) => `
		background: linear-gradient(45deg, ${colors.purple}, ${colors.pink});
		&:hover { transform: scale(1.05); }
	`,
});
```

### Theme System Structure

```js
import { theme } from 'vanilla-bean-components';

// Colors (TinyColor instances with methods)
theme.colors.blue; // Base color
theme.colors.lighter(theme.colors.blue); // Lightness modifier
theme.colors.darker(theme.colors.blue); // Darkness modifier
theme.colors.mostReadable(color, [white, black]); // Accessibility helper

// Font stacks
theme.fonts.kodeMono; // CSS font-family declaration
theme.fonts.fontAwesome; // Icon font CSS

// Pre-built component styles
theme.button; // Complete button CSS
theme.input; // Input field styling
theme.table; // Data table styling
theme.scrollbar; // Custom scrollbar theming
```

## 8. HTTP Request System with Intelligent Caching

```js
import { GET, POST, PATCH, DELETE } from 'vanilla-bean-components/request';
```

### Automatic Caching Rules

- **GET requests**: Always cached by default
- **Mutations without `invalidates`**: Cached by default
- **Mutations with `invalidates`**: NOT cached (assumed state-changing)

```js
// These WILL cache automatically:
await GET('/users');
await POST('/users', { body: newUser }); // No invalidates = cached

// This will NOT cache:
await POST('/users', { body: newUser, invalidates: ['users'] });
```

### Subscription and Cache Invalidation

```js
// Set up subscription for live updates
await GET('/users', {
	apiId: 'users', // Groups related subscriptions
	onRefetch: ({ body, success }) => {
		if (success) updateUsersList(body);
		else showError(body);
	},
});

// Trigger automatic refetch across all 'users' subscribers
await POST('/users', {
	body: newUser,
	invalidates: ['users'], // Clears cache + triggers refetch
});
```

### Advanced Request Patterns

```js
// URL and query parameters
await GET('/users/:id/posts/:postId', {
	urlParameters: { id: '123', postId: '456' },
	searchParameters: { page: 1, limit: 20 },
	// Results in: /users/123/posts/456?page=1&limit=20
});

// Conditional requests
const shouldFetch = user.isLoggedIn;
await GET('/user/profile', {
	enabled: shouldFetch, // Only executes if true
	onRefetch: profile => updateProfile(profile.body),
});

// Manual subscription management
const usersRequest = await GET('/users', { apiId: 'users' });
const { unsubscribe } = usersRequest.subscribe(result => {
	console.log('Users updated:', result.body);
});
```

## 9. Complete Component Library Reference

### Form Components

- **Input** - Comprehensive input supporting ALL HTML input types (text, email, password, number, date, checkbox, radio, range, color, file, etc.) with validation, formatting, and advanced features
- **Select** - Dropdown select with search filtering, multi-selection support, and customizable option rendering
- **Form** - Form validation and submission component with built-in field management, error handling, and flexible validation rules
- **Label** - Accessible label component with form field association, styling options, and support for required field indicators
- **RadioButton** - Radio button input component with group management, customizable styling, and accessibility support

### Layout & Navigation

- **Page** - Layout container component for page structure with header, main content, sidebar, and footer sections
- **Router** - Client-side routing component with hash-based navigation, route matching, and view management
- **List** - Dynamic list component with item rendering, selection support, filtering, and keyboard navigation
- **Table** - Data table component with sorting, filtering, pagination, and customizable cell rendering
- **Menu** - Context menu and dropdown menu component with nested submenus, keyboard navigation, and customizable positioning

### Interaction & Feedback

- **Button** - Interactive button component with keyboard navigation and tooltip support
- **Dialog** - Modal dialog component for user interactions and confirmations
- **Popover** - Floating popover component with intelligent positioning, trigger management, and customizable content display
- **Tooltip** - Contextual tooltip component with smart positioning, hover/focus triggers, and customizable appearance
- **TooltipWrapper** - Base wrapper component that adds tooltip functionality to any child component with configurable positioning and styling
- **Notify** - Toast notification component with customizable styling, positioning, auto-dismiss, and multiple notification types

### Content & Media

- **Code** - Syntax-highlighted code display component with copy-to-clipboard functionality and support for multiple programming languages
- **Icon** - Scalable icon component supporting FontAwesome icons, custom SVG content, and various sizing options
- **Link** - Navigation link component with routing support, external link handling, and accessibility features
- **TagList** - Tag management component with add/remove functionality, input validation, and customizable tag styling

### Data & Input

- **Calendar** - A flexible calendar component supporting month, week, and day views with event management and interactive navigation
- **ColorPicker** - Interactive color picker component with HSL/RGB/HEX support, alpha channel control, and visual color selection interface

### Specialized (Consider for specific use cases)

- **Keyboard** - Virtual keyboard component with customizable layouts, key mapping, and input field integration
- **Whiteboard** - Interactive drawing canvas component with drawing tools, shape creation, collaboration support, and export capabilities

## 10. Critical Implementation Guidelines for AI

### ✅ ALWAYS - Reactive Options in Components

```js
// CORRECT - Component options are reactive
const comp = new Component({ textContent: 'Initial' });
comp.options.textContent = 'Updated'; // DOM updates automatically!

// CORRECT - Use subscribers for dynamic values
const comp = new Component({
	textContent: state.subscriber('count', count => `Count: ${count}`),
	className: state.subscriber('active', active => (active ? 'active' : '')),
});
```

### ❌ NEVER - Static options changes

```js
// WRONG - Elem options are static (one-time processing)
const elem = new Elem({ textContent: 'Static' });
elem.options.textContent = 'Changed'; // NO effect on DOM!
```

### ✅ ALWAYS - Understand Context Proxy Behavior

```js
const ctx = new Context({ value: 1 }); // ctx is a Proxy!
ctx.value = 2; // Triggers setter -> emits events -> updates subscribers
```

### ✅ ALWAYS - Use Input for All HTML Input Types

```js
// CORRECT - Single Input component handles all types
new Component({ tag: 'input', type: 'checkbox' }); // Checkbox
new Component({ tag: 'input', type: 'range' }); // Slider
new Component({ tag: 'input', type: 'date' }); // Date picker
new Component({ tag: 'input', type: 'email' }); // Email validation
```

### ✅ ALWAYS - Leverage Event Handler Options

```js
// Event handlers automatically registered (keys starting with 'on')
new Component({
	onPointerPress: event => console.log('clicked'),
	onChange: event => console.log('value:', event.value), // .value auto-added
	onConnected: () => console.log('added to DOM'), // DOM observation
});
```

### ✅ ALWAYS - Use HTTP Request Caching Strategically

```js
// GET requests cached automatically
await GET('/users');

// Mutations with invalidation not cached but trigger refetch
await POST('/users', {
	body: newUser,
	invalidates: ['users'], // Clears cache + notifies subscribers
});
```

### ✅ ALWAYS - Styled Components Generate Scoped CSS

```js
// Function syntax allows default options
const StyledComponent = styled(Component, theme => `css`, { tag: 'div' });

// Template literal requires explicit options
const StyledComponent = styled.Component`css`;
new StyledComponent({ tag: 'div' }); // Must specify tag
```

### ✅ ALWAYS - Memory Management is Automatic

Components automatically handle:

- Event listener cleanup on DOM disconnect
- Context subscription cleanup
- HTTP request subscription cleanup
- CSS injection cleanup

This guide provides complete implementation knowledge for building applications with Vanilla Bean Components, emphasizing the reactive patterns, component lifecycle, and proper usage of the library's core architecture.
