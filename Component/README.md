# Component

Reactive component class extending Elem with Context integration, lifecycle management, and automatic cleanup.

## Core Features

- **Reactive options** - Properties backed by Context emit events on changes
- **Automatic cleanup** - Event listeners and resources cleaned up on DOM disconnect
- **Flexible rendering** - Configurable render timing (immediate, onload, animationFrame)
- **Event routing** - Input events get `.value` property, connection events use DOM observation
- **Style processing** - Inline objects or scoped CSS via theme system
- **Lifecycle hooks** - onHover, onPointerPress with automatic cleanup

## Constructor

```js
new Component(options?, ...children)
```

### Configuration Options

| Option             | Type                                  | Description                                 |
| ------------------ | ------------------------------------- | ------------------------------------------- |
| `tag`              | `string`                              | HTML tag name (default: 'div')              |
| `autoRender`       | `boolean\|'onload'\|'animationFrame'` | Render timing control                       |
| `registeredEvents` | `Set<string>`                         | Custom event types for on() method          |
| `knownAttributes`  | `Set<string>`                         | Attribute names for elem.setAttribute()     |
| `priorityOptions`  | `Set<string>`                         | Option keys processed first during render   |
| `style`            | `object`                              | Inline CSS properties                       |
| `attributes`       | `object`                              | HTML attributes                             |
| `styles`           | `string\|object\|Function`            | CSS string, style object, or theme function |

All standard Elem options supported. Children arguments appended to `append` option.

## Usage Patterns

### One-Off Components

```js
const input = new Component({
	tag: 'input',
	value: 'Initial text',
	onChange: ({ value }) => {
		input.options.value = value;
	},
	appendTo: document.body,
});

new Component({
	tag: 'p',
	textContent: input.options.subscriber('value', value => `Current: ${value}`),
	appendTo: document.body,
});
```

### Extended Components

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

### With styled()

```js
const StyledComponent = styled(
	Component,
	({ colors }) => `
	background: ${colors.blue};
	color: ${colors.white};
`,
);
```

## Reactive Options System

Component options stored in Context instance (vs plain object in Elem) - property changes trigger re-processing:

```js
const button = new Component({ textContent: 'Click me' });
button.options.textContent = 'Updated'; // Triggers DOM update via Context
button.options.addClass = 'active'; // Adds CSS class reactively

// Context features available
const subscription = button.options.subscribe({
	key: 'textContent',
	callback: value => console.log('Text changed:', value),
});
```

### Option Routing

Options routed based on key and value type via `_setOption`:

- **Event handlers** - Keys starting with 'on' registered via on() method
- **Known attributes** - Set via elem.setAttribute()
- **Component methods** - Called with value as parameter
- **HTMLElement properties** - Set directly on elem
- **Functions** - Stored as component properties
- **Default** - Set as elem properties

## Options Reference

### Component-Specific Options

These options trigger Component-specific behavior:

```js
styles: Function; // Theme function for scoped CSS
onHover: Function; // Hover handler with move tracking
onPointerPress: Function; // Press sequence handler
uniqueId: string; // Override auto-generated unique ID
augmentedUI: string | boolean; // data-augmented-ui attribute
```

### All Elem Options Work as Options

Standard Elem methods work perfectly as reactive options:

```js
new Component({
	textContent: 'Hello', // Sets textContent reactively
	addClass: 'btn primary', // Adds classes reactively
	setStyle: { color: 'red' }, // Sets styles reactively
	append: [child1, child2], // Appends children reactively
	appendTo: document.body, // Appends to parent reactively
	// Any Elem method works as an option
});
```

### Event Handler Options

Event handlers registered automatically when option key starts with 'on':

```js
onClick: Function; // click events
onChange: Function; // change events (input elements get .value)
onConnected: Function; // DOM connection detection
onCustomEvent: Function; // Custom events (if in registeredEvents)
```

## Event System

### on() Method

```js
component.on({ targetEvent, callback, id? })
```

**Input Events** (`keydown`, `keyup`, `change`, `blur`, `input`, `search`)

- Augments event object with `.value` property
- Handles checkbox checked state and input values

**Connection Events** (`connected`, `disconnected`)

- Uses DOM observation for reliable detection
- Triggers cleanup on disconnect

**Common Events** (pointer events, contextmenu)

- Direct addEventListener registration
- Automatic cleanup tracking

### Specialized Event Handlers

```js
// Hover with move tracking
component.onHover(event => console.log(event.clientX, event.clientY));

// Press detection (down-to-up sequence)
component.onPointerPress(event => console.log('Complete press'));
```

## Lifecycle Management

### Rendering

```js
component.render(); // Process all options through _setOption
```

- Clears content when re-rendering (`rendered` flag reset)
- Processes priority options first
- Sets `rendered = true` when complete

### Cleanup System

```js
component.addCleanup('id', () => console.log('cleanup'));
component.processCleanup(); // Execute all cleanup functions
```

- Automatic cleanup on DOM disconnect
- Recursive cleanup of child components
- Manual cleanup function execution

## Styling

### Inline Styles

```js
component.styles({ color: 'red', padding: '10px' });
// Or as option: new Component({ styles: { color: 'red' } });
```

### Scoped CSS

```js
// Theme function with automatic scoping
component.styles(
	({ colors }) => `
  background: ${colors.blue};
  &:hover { background: ${colors.darker(colors.blue)}; }
`,
);
// Or as option: new Component({ styles: themeFunction });
```

CSS processed through PostCSS and injected with unique class scope.

## Methods Reference

### Options-Compatible Methods

These methods can be called via options or directly:

```js
// Via options (reactive)
new Component({
	styles: ({ colors }) => `color: ${colors.blue};`,
	onHover: event => console.log('hover'),
	addClass: 'active',
	setStyle: { padding: '10px' },
	append: [child1, child2],
});

// Direct calls (immediate)
component.styles(styleFunction);
component.onHover(callback);
component.addClass('active');
component.setStyle({ padding: '10px' });
component.append(child1, child2);
```

### Direct-Only Methods

These methods don't make sense as options:

```js
component.render(); // Lifecycle method
component.addCleanup(id, fn); // Cleanup registration
component.processCleanup(); // Manual cleanup execution
component.on({ targetEvent, callback }); // Event registration
component.emit(eventType, detail); // Event dispatch
component.ancestry(); // Prototype chain inspection
```

### Properties

```js
component.parent; // Parent Component/Elem instance
component.children; // Child Component/Elem instances
component.uniqueId; // Frozen unique identifier
component.options; // Reactive Context instance (not plain object like Elem)
```

## Memory Management

- Event listeners auto-removed on disconnect
- Context subscriptions cleaned up
- Style elements removed from DOM
- Child component cleanup cascades
- Manual cleanup registration system
