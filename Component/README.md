# Component

The Component class is an Elem with more capabilities. This class is intended to create high-level custom components and more complex sub-components than what an Elem supports. The main differences here are focused around observable options, rendering, event listening & emitting, and runtime styling.

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

new Elem({
	tag: 'p',
	textContent: input.options.subscriber('value', value => `The current value is: ${value}`),
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

	render() {
		super.render();
	}

	_setOption(key, value) {
		if (key === 'mode') this.removeClass(/\bmode-\S+\b/g).addClass(`mode-${value}`);
		else super._setOption(key, value);
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

### Options & methods

The Class instance property `options` is built on Context. All `set` operations run through the internal method `_setOption`. The base `_setOption` method handles applying options as either method calls or property sets. Keys that exist on the Component class take precedence, otherwise apply to the base HTMLElement. Additional behavior can be configured or overwritten in extended components by overlaying the `_setOption` method. Option changes can also be observed and subscribed to via the Context API.

- Elem configuration
  - `@param {Boolean | 'onload' | 'animationFrame'} options.autoRender - Control when to render the component`
  - `@param {Set} knownAttributes - Options to send to elem.setAttribute`
  - `@param {Set} priorityOptions - Options to process first when processing a whole options object`
- Component options/methods
  - `styles: (theme, this) => String`
  - `onHover: (event) => (() => removeEventListener)`
  - `onPointerPress: (event) => (() => removeEventListener)`

### Additional Methods

A Component also comes with some additional methods that don't make sense to use with options:

- `render()`
- `addCleanup(id, cleanupFunction)`
- `processCleanup(cleanup = this.cleanup)`
- `on({ targetEvent, id = targetEvent, callback })`
- `emit(eventType, detail)`
- `toString => '[object Component]'`
