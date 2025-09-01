# Elem

Enhanced DOM element wrapper providing fluent API methods while maintaining direct access to the underlying HTMLElement.

## Key Features

- **Fluent method chaining** - Chainable methods for building complex DOM structures
- **Intelligent option routing** - Automatic routing of properties to appropriate DOM methods
- **Enhanced class manipulation** - Regular expression support for class operations
- **Flexible content handling** - Support for text, HTML, and nested element content
- **Direct DOM access** - Full HTMLElement API via `.elem` property
- **EventTarget integration** - Built-in event handling capabilities

## Basic Usage

### Simple Element Creation

Create DOM elements with enhanced manipulation capabilities:

```js
import { Elem } from 'vanilla-bean-components';

const button = new Elem({
	tag: 'button',
	textContent: 'Click me',
	className: 'btn btn-primary',
	onclick: () => alert('Clicked!'),
	appendTo: document.body,
});
```

### Complex Nested Structures

Build complex DOM hierarchies with nested elements:

```js
const card = new Elem(
	{
		tag: 'div',
		className: 'card',
		style: { padding: '20px', margin: '10px' },
	},
	new Elem({ tag: 'h3', textContent: 'Card Title' }),
	new Elem({ tag: 'p', textContent: 'Card content goes here.' }),
);
```

### Method Chaining

Chain methods for fluent DOM construction:

```js
const navigation = new Elem({ tag: 'nav' })
	.addClass('menu', 'horizontal')
	.setStyle({ display: 'flex', gap: '16px' })
	.append(
		new Elem({ tag: 'a', textContent: 'Home', href: '/' }),
		new Elem({ tag: 'a', textContent: 'About', href: '/about' }),
		new Elem({ tag: 'a', textContent: 'Contact', href: '/contact' }),
	)
	.appendTo(document.body);
```

### Direct DOM Access

Access the full HTMLElement API when needed:

```js
const input = new Elem({ tag: 'input', type: 'text' });

// Enhanced methods
input.addClass('form-control').setStyle({ width: '100%' });

// Direct DOM access
input.elem.focus();
input.elem.select();
input.elem.scrollIntoView({ behavior: 'smooth' });
```

## Configuration Options

### Constructor Syntax

```js
new Elem(options?, ...children)
```

**Parameters:**

- `options` (Object) - Configuration options and HTML properties
- `children` (...Elem|HTMLElement|string) - Child elements or text content

### Core Options

| Option       | Type                        | Description                        |
| ------------ | --------------------------- | ---------------------------------- |
| `tag`        | `string`                    | HTML tag name (default: 'div')     |
| `style`      | `object`                    | CSS properties as key-value pairs  |
| `attributes` | `object`                    | HTML attributes as key-value pairs |
| `content`    | `string\|Elem\|HTMLElement` | Element content                    |
| `appendTo`   | `Elem\|HTMLElement`         | Parent element to append to        |
| `prependTo`  | `Elem\|HTMLElement`         | Parent element to prepend to       |
| `append`     | `Array`                     | Child elements to append           |
| `prepend`    | `Array`                     | Child elements to prepend          |

### HTML Properties

All standard HTMLElement properties work as options:

```js
new Elem({
	// Content properties
	textContent: 'Button text',
	innerHTML: '<span>HTML content</span>',

	// Form properties
	value: 'input value',
	checked: true,
	disabled: false,

	// Element properties
	id: 'unique-id',
	className: 'btn primary',
	title: 'Tooltip text',

	// Link properties
	href: 'https://example.com',
	target: '_blank',

	// Image properties
	src: 'image.jpg',
	alt: 'Image description',
});
```

### Event Handler Properties

Event handlers can be assigned directly:

```js
new Elem({
	tag: 'button',
	onclick: event => console.log('clicked'),
	onmouseover: event => console.log('hover'),
	onchange: event => console.log('changed'),
	onfocus: event => console.log('focused'),
});
```

## DOM Manipulation

### Content Management

```js
// Set content (replaces existing)
elem.content('New text content');
elem.content(new Elem({ tag: 'span', textContent: 'HTML element' }));

// Clear all content
elem.empty();
```

### Child Element Management

```js
// Add children
elem.append(child1, child2, 'text content');
elem.prepend(child1, child2);

// Access children
const childElements = elem.children; // Array of Elem instances
const nativeChildren = elem.elem.children; // HTMLCollection
```

### Hierarchy Management

```js
// Add to DOM
elem.appendTo(document.body);
elem.prependTo(document.querySelector('.container'));

// Navigate hierarchy
const parentElem = elem.parent; // Parent Elem instance (if exists)
const nativeParent = elem.parentElem; // Parent HTMLElement
```

### Style and Attribute Management

```js
// Set multiple styles
elem.setStyle({
	color: 'red',
	fontSize: '16px',
	backgroundColor: '#f0f0f0',
});

// Set multiple attributes
elem.setAttributes({
	'data-id': '123',
	'aria-label': 'Close button',
	role: 'button',
});
```

## Class Management

### Enhanced Class Operations

Elem provides enhanced class manipulation with regular expression support:

```js
// Check for classes
elem.hasClass('active'); // Check single class
elem.hasClass('btn', 'primary'); // Check multiple classes
elem.hasClass(/^btn-/); // Check with regex pattern

// Add classes
elem.addClass('new-class');
elem.addClass('class1', 'class2', 'class3');

// Remove classes
elem.removeClass('old-class');
elem.removeClass(/^temp-/); // Remove all classes starting with 'temp-'
elem.removeClass(/\bmobile-\w+/g); // Remove classes matching pattern

// Toggle classes
elem.toggleClass('active');
```

### Class Manipulation Examples

```js
const button = new Elem({ tag: 'button', className: 'btn btn-primary temp-123' });

// Remove all temporary classes
button.removeClass(/^temp-/);

// Add state classes
button.addClass('btn-large', 'btn-rounded');

// Conditional classes
if (isActive) {
	button.addClass('active', 'selected');
}

// Check for button variants
if (button.hasClass(/^btn-(primary|secondary|danger)$/)) {
	console.log('Has button variant class');
}
```

## Event Handling

### EventTarget Integration

Elem extends EventTarget, providing full event capabilities:

```js
const button = new Elem({ tag: 'button', textContent: 'Click me' });

// Option-based event handlers
new Elem({
	tag: 'input',
	onchange: event => console.log('Value changed:', event.target.value),
	onfocus: event => event.target.select(),
});

// addEventListener method
button.addEventListener('click', event => {
	console.log('Button clicked');
});

// Custom events
button.addEventListener('customEvent', event => {
	console.log('Custom event data:', event.detail);
});

// Dispatch events
button.dispatchEvent(
	new CustomEvent('customEvent', {
		detail: { message: 'Hello' },
	}),
);
```

### Event Handler Options vs Methods

```js
// Via constructor options (preferred for initial setup)
const elem = new Elem({
	tag: 'button',
	onclick: handleClick,
	onmouseover: handleHover,
});

// Via addEventListener (preferred for dynamic binding)
elem.addEventListener('click', handleClick);
elem.addEventListener('mouseover', handleHover);

// Via native element
elem.elem.addEventListener('click', handleClick);
```

## API Reference

### Constructor

```js
new Elem(options?, ...children)
```

### Core Methods

#### Content Methods

```js
elem.content(content); // Set element content
elem.empty(); // Remove all child elements
```

#### Child Management Methods

```js
elem.append(...children); // Append child elements
elem.prepend(...children); // Prepend child elements
elem.appendTo(parent); // Append to parent element
elem.prependTo(parent); // Prepend to parent element
```

#### Style and Attribute Methods

```js
elem.setStyle(styles); // Set CSS properties
elem.setAttributes(attributes); // Set HTML attributes
elem.setOptions(options); // Set multiple options at once
```

#### Class Methods

```js
elem.hasClass(...classes); // Check for classes (supports regex)
elem.addClass(...classes); // Add CSS classes
elem.removeClass(...classes); // Remove CSS classes (supports regex)
elem.toggleClass(className); // Toggle CSS class
```

### Properties

```js
elem.elem; // Underlying HTMLElement
elem.parent; // Parent Elem instance (if created by Elem)
elem.parentElem; // Parent HTMLElement
elem.children; // Array of child Elem instances
elem.options; // Configuration options object
```

### Utility Methods

```js
elem.toString(); // Returns '[object Elem]'
elem.ancestry(); // Get prototype chain information
```

## Integration with Component

Elem serves as the foundation for the Component class:

```js
import { Component } from 'vanilla-bean-components';

// Component extends Elem with reactive options
const component = new Component({
	tag: 'div',
	textContent: 'I am reactive!',
});

// All Elem methods available
component.addClass('component-class');
component.setStyle({ padding: '16px' });

// Plus Component-specific features
component.options.textContent = 'Updated reactively!';
```

## Performance Considerations

- **Direct DOM access** - Use `elem.elem` for performance-critical operations
- **Method chaining** - Efficient for building complex structures
- **Class operations** - Regular expressions processed efficiently
- **Event handling** - EventTarget integration provides optimal event performance
