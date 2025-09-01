# Component

Reactive component class extending Elem with Context integration, lifecycle management, and automatic cleanup.

## Key Features

- **Reactive options system** - Property changes backed by Context emit events and update DOM automatically
- **Automatic memory management** - Event listeners and resources cleaned up on DOM disconnect
- **Flexible render timing** - Immediate, onload, or animationFrame rendering modes
- **Enhanced event handling** - Input events include `.value` property, DOM connection detection
- **Integrated styling** - Inline objects or scoped CSS with theme system integration
- **Lifecycle hooks** - Built-in hover and press handlers with automatic cleanup

```js
import { Component } from 'vanilla-bean-components';
```

## Basic Usage

### Simple Components

Every Component extends EventTarget and wraps an HTMLElement with reactive options:

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

### Reactive Property Updates

Options are backed by Context - property changes trigger DOM updates automatically:

```js
const input = new Component({
	tag: 'input',
	value: 'Initial text',
	onChange: ({ value }) => {
		input.options.value = value; // Updates DOM reactively
	},
	appendTo: document.body,
});

// Display that updates automatically
new Component({
	tag: 'p',
	textContent: input.options.subscriber('value', value => `Current: ${value}`),
	appendTo: document.body,
});
```

### Extended Component Classes

Create reusable component classes with custom behavior:

```js
class Button extends Component {
	constructor(options = {}, ...children) {
		super(
			{
				tag: 'button',
				...options,
				styles: ({ button }) => `
				${button}
				${options.styles?.({ button }) || ''}
			`,
			},
			...children,
		);
	}

	_setOption(key, value) {
		if (key === 'mode') {
			this.removeClass(/\bmode-\S+/g).addClass(`mode-${value}`);
		} else {
			super._setOption(key, value);
		}
	}
}
```

### With Styled Components

Components integrate seamlessly with the styled system:

```js
import { styled } from 'vanilla-bean-components';

const StyledComponent = styled(
	Component,
	({ colors }) => `
	background: ${colors.blue};
	color: ${colors.white};
	padding: 16px;
	border-radius: 8px;
`,
);
```

## Reactive Options System

Component options are stored in a Context instance (not plain object like Elem), enabling automatic reactivity:

```js
const button = new Component({ textContent: 'Click me' });

// Property changes trigger DOM updates
button.options.textContent = 'Updated'; // Updates DOM via Context
button.options.addClass = 'active'; // Adds CSS class reactively

// Full Context features available
const subscription = button.options.subscribe({
	key: 'textContent',
	callback: value => console.log('Text changed:', value),
});
```

### Option Processing Pipeline

Options are routed through `_setOption` based on key and value type:

| Condition                | Routing                    | Example                |
| ------------------------ | -------------------------- | ---------------------- |
| Key starts with 'on'     | Event handler registration | `onClick: handler`     |
| Key in `knownAttributes` | `elem.setAttribute()`      | `id: 'my-id'`          |
| Component has method     | Method call with value     | `addClass: 'active'`   |
| HTMLElement has property | Direct elem property       | `textContent: 'hello'` |
| Value is function        | Component property         | `customMethod: fn`     |
| Default                  | Elem property assignment   | `customProp: value`    |

## Event Handling

### Automatic Event Registration

Event handlers are registered automatically when option keys start with 'on':

```js
new Component({
	onClick: event => console.log('clicked'),
	onChange: ({ value }) => console.log('value:', value), // Input events include .value
	onConnected: () => console.log('added to DOM'),
	onDisconnected: () => console.log('removed from DOM'),
});
```

### Enhanced Input Events

Input-related events (`keydown`, `keyup`, `change`, `blur`, `input`, `search`) receive enhanced event objects:

```js
new Component({
	tag: 'input',
	type: 'text',
	onChange: ({ value, event }) => {
		console.log('New value:', value); // Extracted from input
		console.log('Original event:', event);
	},
});
```

### Connection Events

DOM connection/disconnection detected via MutationObserver:

```js
new Component({
	onConnected: () => console.log('Component added to DOM'),
	onDisconnected: () => {
		console.log('Component removed - cleanup triggered');
	},
});
```

### Specialized Event Handlers

#### Hover with Movement Tracking

```js
component.onHover(event => {
	console.log('Mouse position:', event.clientX, event.clientY);
});
```

#### Press Detection

Detects complete press sequence (down → up):

```js
component.onPointerPress(event => {
	console.log('Complete press detected');
});
```

## Styling

### Inline Style Objects

Apply styles as JavaScript objects:

```js
component.styles({
	color: 'red',
	padding: '10px',
	backgroundColor: '#f0f0f0',
});

// Or as option
new Component({
	styles: { color: 'red', padding: '10px' },
});
```

### Scoped CSS with Theme Integration

Use theme functions for scoped, processed CSS:

```js
// Theme function with automatic scoping and PostCSS processing
component.styles(
	({ colors, fonts }) => `
	background: ${colors.blue};
	${fonts.kodeMono}
	padding: 16px;
	border-radius: 8px;

	&:hover {
		background: ${colors.darker(colors.blue)};
	}

	@media (max-width: 768px) {
		padding: 8px;
	}
`,
);
```

CSS is processed through PostCSS, receives unique class scope, and is injected into the DOM automatically.

## Lifecycle Management

### Rendering Process

```js
component.render(); // Process all options through _setOption
```

Rendering behavior:

1. **Content clearing** - Removes existing content when re-rendering
2. **Priority processing** - Processes `priorityOptions` first
3. **Option routing** - Each option processed via `_setOption`
4. **Completion flag** - Sets `rendered = true`

### Automatic Cleanup System

Components automatically clean up resources when removed from DOM:

```js
// Manual cleanup registration
component.addCleanup('unique-id', () => {
	console.log('Custom cleanup executed');
});

// Manual cleanup execution (automatic on disconnect)
component.processCleanup();
```

**Automatic cleanup includes:**

- Event listener removal
- Context subscription cleanup
- Style element removal from DOM
- Recursive child component cleanup

### Render Timing Control

Control when components render with `autoRender` option:

```js
// Immediate rendering (default)
new Component({ autoRender: true });

// Render on window load event
new Component({ autoRender: 'onload' });

// Render on next animation frame
new Component({ autoRender: 'animationFrame' });

// Manual rendering only
new Component({ autoRender: false });
```

## API Reference

### Constructor

```js
new Component(options?, ...children)
```

**Parameters:**

- `options` (Object) - Configuration options
- `children` (...Component|Elem) - Child elements appended to `append` option

### Configuration Options

#### Component-Specific Options

| Option             | Type                                  | Description                                 |
| ------------------ | ------------------------------------- | ------------------------------------------- |
| `tag`              | `string`                              | HTML tag name (default: 'div')              |
| `autoRender`       | `boolean\|'onload'\|'animationFrame'` | Render timing control                       |
| `registeredEvents` | `Set<string>`                         | Custom event types for on() method          |
| `knownAttributes`  | `Set<string>`                         | Attribute names for elem.setAttribute()     |
| `priorityOptions`  | `Set<string>`                         | Option keys processed first during render   |
| `styles`           | `string\|object\|Function`            | CSS string, style object, or theme function |
| `uniqueId`         | `string`                              | Override auto-generated unique ID           |
| `augmentedUI`      | `string\|boolean`                     | data-augmented-ui attribute                 |

#### Event Handler Options

| Option           | Type       | Description                                  |
| ---------------- | ---------- | -------------------------------------------- |
| `onHover`        | `Function` | Hover handler with move tracking             |
| `onPointerPress` | `Function` | Press sequence handler                       |
| `onClick`        | `Function` | Click event handler                          |
| `onChange`       | `Function` | Change event handler (input .value included) |
| `onConnected`    | `Function` | DOM connection detection                     |
| `onDisconnected` | `Function` | DOM disconnection detection                  |

All standard Elem options work as reactive Component options.

### Methods

#### Options-Compatible Methods

Can be called directly or used as reactive options:

```js
component.styles(styleFunction); // Direct call
component.onHover(callback); // Direct call
component.addClass('active'); // Direct call
component.append(child); // Direct call

// Or as reactive options:
new Component({
	styles: styleFunction,
	onHover: callback,
	addClass: 'active',
	append: [child],
});
```

#### Lifecycle Methods

```js
component.render(); // Process all options
component.addCleanup(id, fn); // Register cleanup function
component.processCleanup(); // Execute cleanup functions
```

#### Event Methods

```js
component.on({ targetEvent, callback, id? }); // Event registration
component.emit(eventType, detail);             // Event dispatch
```

#### Utility Methods

```js
component.ancestry(); // Prototype chain inspection
```

### Properties

```js
component.parent; // Parent Component/Elem instance
component.children; // Child Component/Elem instances
component.uniqueId; // Frozen unique identifier
component.options; // Reactive Context instance
component.elem; // Underlying HTMLElement
component.rendered; // Boolean render status flag
```

## Memory Management

Components provide comprehensive automatic memory management:

- **Event listeners** - Automatically removed on DOM disconnect
- **Context subscriptions** - Cleaned up when component destroyed
- **Style elements** - Removed from DOM head on cleanup
- **Child components** - Recursive cleanup propagation
- **Custom cleanup** - Manual cleanup function registration

No manual cleanup required for typical usage - components handle resource management automatically.
