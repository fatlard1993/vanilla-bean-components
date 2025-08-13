# Elem

A lightweight wrapper around DOM elements that provides enhanced manipulation methods while maintaining direct access to the underlying HTMLElement.

## Features

- Fluent API with method chaining
- Automatic option routing to appropriate methods/properties
- Enhanced class manipulation with regex support
- Flexible content and child element handling
- Direct access to native HTMLElement via `.elem`

## Usage

```js
import { Elem } from './Elem';

// Basic element creation
const button = new Elem({
	tag: 'button',
	textContent: 'Click me',
	className: 'btn btn-primary',
	onclick: () => alert('Clicked!'),
	appendTo: document.body,
});

// Complex nested structure
const card = new Elem(
	{
		tag: 'div',
		className: 'card',
		style: { padding: '20px', margin: '10px' },
	},
	new Elem({ tag: 'h3', textContent: 'Card Title' }),
	new Elem({ tag: 'p', textContent: 'Card content goes here.' }),
);

// Method chaining
const menu = new Elem({ tag: 'nav' })
	.addClass('menu', 'horizontal')
	.append(
		new Elem({ tag: 'a', textContent: 'Home', href: '/' }),
		new Elem({ tag: 'a', textContent: 'About', href: '/about' }),
	)
	.appendTo(document.body);
```

## Constructor

`new Elem(options, ...children)`

### Configuration Options

| Option       | Type                        | Description                        |
| ------------ | --------------------------- | ---------------------------------- |
| `tag`        | `string`                    | HTML tag name (default: 'div')     |
| `style`      | `object`                    | CSS properties as key-value pairs  |
| `attributes` | `object`                    | HTML attributes as key-value pairs |
| `content`    | `string\|Elem\|HTMLElement` | Element content                    |
| `appendTo`   | `Elem\|HTMLElement`         | Parent to append to                |
| `prependTo`  | `Elem\|HTMLElement`         | Parent to prepend to               |
| `append`     | `Array`                     | Child elements to append           |
| `prepend`    | `Array`                     | Child elements to prepend          |

### HTMLElement Properties

All standard HTMLElement properties are supported:

- `className`, `id`, `textContent`, `innerHTML`, `innerText`
- `disabled`, `value`, `checked`, `selected`
- Event handlers: `onclick`, `onchange`, `onsubmit`, etc.
- Element-specific properties (e.g., `href` for anchors, `src` for images)

## Methods

### Class Management

```js
elem.hasClass('active', /^btn-/); // Check classes (supports regex)
elem.addClass('new-class'); // Add classes
elem.removeClass(/^temp-/); // Remove classes (supports regex)
```

### Content & Structure

```js
elem.content('New text'); // Set content
elem.append(child1, child2); // Append children
elem.prepend(child1, child2); // Prepend children
elem.empty(); // Remove all children
```

### Styling & Attributes

```js
elem.setStyle({ color: 'red', fontSize: '16px' });
elem.setAttributes({ 'data-id': '123', role: 'button' });
```

### Hierarchy

```js
elem.appendTo(parent); // Append to parent
elem.prependTo(parent); // Prepend to parent
elem.parent; // Get parent Elem instance
elem.parentElem; // Get parent HTMLElement
elem.children; // Get child Elem instances
```

### Utility

```js
elem.setOptions({ className: 'new', textContent: 'Updated' });
elem.toString(); // Returns '[object Elem]'
```

## Direct DOM Access

Access the underlying HTMLElement via the `.elem` property:

```js
const myElem = new Elem({ tag: 'div' });
myElem.elem.focus(); // Call native methods
myElem.elem.scrollIntoView(); // Access full DOM API
```

## Event Handling

Elem extends EventTarget, so you can use standard event methods:

```js
const elem = new Elem({ tag: 'button' });

// Via options
new Elem({ tag: 'button', onclick: handleClick });

// Via addEventListener
elem.addEventListener('click', handleClick);

// Via native element
elem.elem.addEventListener('click', handleClick);
```
