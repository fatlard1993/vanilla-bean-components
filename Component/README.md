# Component

xxx

## Usage

```js
new Component(options, ...children);
```

### One-Off Elements

```js
const input = new Component({
	tag: 'input',
	value: 'Some text',
	onChange: ({ value: newValue }) => {
		component.options.value = newValue;
	},
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
				styles: (theme, component) => `
					${theme.button}

					${options.styles?.(theme, component) || ''}
				`,
			},
			...children,
		);
	}

	setOption(key, value) {
		if (key === 'mode') this.removeClass(/\bmode-\S+\b/g).addClass(`mode-${value}`);
		else super.setOption(key, value);
	}
}
```

### Styled Components

```js
const FocusedContent = styled(
	Component,
	({ colors }) => `
		background-color: ${colors.black};
		color: ${colors.lighter(colors.blue)};
	`,
);
```

## Elem

An Element (`Elem` class) is a lightweight wrapping of createElement and its resulting HTMLElement object. You can think of it like a little toolbox that comes with every element.

### Options & methods

Everything in a Elem can be controlled by its `options`. In addition to configuration, `options` offers access to properties, methods, and events of the Elem class and its `.elem` HTMLElement.

- ...[EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)
- ...[Node](https://developer.mozilla.org/en-US/docs/Web/API/Node)
- ...[Element](https://developer.mozilla.org/en-US/docs/Web/API/Element)
  - `className: String`
  - `id: String`
  - `innerHTML: String`
  - `before: HTMLElement`
- ...[HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)
  - `innerText: String`
- ...[Target HTML tag class, Ex: HTMLButtonElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLButtonElement)
  - `disabled: Boolean`
- Elem configuration
  - `@param {String} tag - The HTML tag`
- Elem options/methods
  - `(setStyle || style): Object`
  - `(setAttributes || attributes): Object`
  - `content: String || Elem || HTMLElement`
  - `appendTo: Elem || HTMLElement`
  - `prependTo: Elem || HTMLElement`
  - `append: ...(Elem || HTMLElement)`
  - `prepend: ...(Elem || HTMLElement)`

### Additional Methods

Not all Elem methods make sense to use with options:

- `setOption(key, value)`
  - _This method is used internally to synchronize options property changes and not intended to be called directly_
- `setOptions(options)`
- `hasClass(...classes) => Boolean`
- `addClass(...classes) => this`
- `removeClass(...classes) => this`
- `toString => '[object Elem]'`
- `empty`

## Component

A Component class is an Elem with even more tools and capabilities. This class is intended to create high-level custom components and more complex sub-components than what an Elem supports. The main differences here are focused around observable options, rendering, event listening & emitting, and runtime styling.

### Options & methods

A Component offers everything the Elem offers with a handful of additions.

Class instance property `options` is built on Context. All `set` operations run through the internal method `setOption`. The base `setOption` method handles applying options as either method calls or property sets. Keys that exist on the Component class take precedence, otherwise apply to the base HTMLElement. Additional behavior can be configured or overwritten in extended components by overlaying the `setOption` method. Option changes can also be observed and subscribed to via the Context API.

- Elem configuration
  - `@param {Boolean} autoRender - Automatically render the component when constructed`
  - `@param {Set} knownAttributes - Options to send to elem.setAttribute`
  - `@param {Set} priorityOptions - Options to process first when processing a whole options object`
- Component options/methods
  - `styles: (theme, this) => String`
  - `onHover: (event) => (() => removeEventListener)`
  - `onPointerPress: (event) => (() => removeEventListener)`

### Additional Methods

A Component also comes with some additional methods that don't make sense to use with options:

- `render()`
- `get parentElem`
- `get parent`
- `get children`
- `addCleanup(id, cleanupFunction)`
- `processCleanup(cleanup = this.cleanup)`
- `on({ targetEvent, id = targetEvent, callback })`
- `emit(eventType, detail)`
- `toString => '[object Component]'`
