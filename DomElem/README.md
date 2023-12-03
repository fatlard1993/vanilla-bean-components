# DomElem

Vanilla JS class-based component building block

## Usage

```javascript
new DomElem(options, ...children);
```

### One-Off Elements

```javascript
const input = new DomElem({
	tag: 'input',
	value: 'Some text',
	onChange: ({ value: newValue }) => {
		component.options.value = newValue;
	},
	appendTo: document.body,
});

new DomElem({
	tag: 'p',
	textContent: component.options.subscriber('value', value => `The current value is: ${value}`),
	appendTo: document.body,
});
```

### Extended Components

```javascript
class Button extends DomElem {
	constructor(options = {}, ...children) {
		super(
			{
				tag: 'button',
				...options,
				styles: (theme, domElem) => `
					${theme.button}

					${options.styles?.(theme, domElem) || ''}
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

```javascript
const FocusedContent = styled(
	DomElem,
	({ colors }) => `
		background-color: ${colors.black};
		color: ${colors.lighter(colors.blue)};
	`,
);
```

### Context

```javascript
const context = new Context({
	myCustomState: 'aString',
});

console.log(context.myCustomState);
// log: 'aString'

context.addEventListener('myCustomState', ({ detail: value }) => console.log(`new value: ${value}`));

context.myCustomState = 'bString';
// log: 'new value: bString'
```

## Options

Everything in a DomElem can be controlled by its `options`. In addition to configuration, `options` offers access to properties, methods, and events of the DomElem class and its base HTMLElement.

Class instance property `options` is built on Context.
All `set` operations run through the internal method `setOption`.
The base `setOption` method handles applying options as either method calls or property sets.
Keys that exist on the DomElem class take precedence, otherwise apply to the base HTMLElement.
Additional behavior can be configured or overwritten in extended components by overlaying the `setOption` method.
Option changes can also be observed and subscribed to via the Context API.

- ...[EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)
- ...[Node](https://developer.mozilla.org/en-US/docs/Web/API/Node)
- ...[Element](https://developer.mozilla.org/en-US/docs/Web/API/Element)
  - className: String
  - id: String
  - innerHTML: String
  - before: HTMLElement
- ...[HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)
  - innerText: String
- ...[Target HTML tag class, Ex: HTMLButtonElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLButtonElement)
  - disabled: Boolean
- DomElem options
  - @param {String} tag - The HTML tag
  - @param {Boolean} autoRender - Automatically render the component when constructed
  - @param {Set} knownAttributes - options to send to elem.setAttribute
  - @param {Set} priorityOptions - options to process first when processing a whole options object
  - @param {Object} style - style properties to set in the resulting HTMLElement
- DomElem methods
  - content: String || DomElem || HTMLElement
  - appendTo: DomElem || HTMLElement
  - prependTo: DomElem || HTMLElement
  - append: ...(DomElem || HTMLElement)
  - prepend: ...(DomElem || HTMLElement)
  - (setAttributes || attributes): Object
  - styles: (theme, this) => String
  - globalStyles: (theme, this) => String
  - onContextMenu: (event) => (() => removeEventListener)
  - onHover: (event) => (() => removeEventListener)
  - onMouseLeave: (event) => (() => removeEventListener)
  - onPointerDown: (event) => (() => removeEventListener)
  - onPointerUp: (event) => (() => removeEventListener)
  - onPointerPress: (event) => (() => removeEventListener)
  - onPointerPressAndHold: (event) => (() => removeEventListener)
  - onKeyDown: (event) => (() => removeEventListener)
  - onKeyUp: (event) => (() => removeEventListener)
  - onChange: (event) => (() => removeEventListener)
  - onBlur: (event) => (() => removeEventListener)

## Additional Methods

Not all DomElem methods make sense to use with options:

- render(options)
- setOption(name, value)
  - _This method is used internally to synchronize options property changes and not intended to be called directly_
- setOptions(options)
- hasClass(...classes) => Boolean
- addClass(...classes) => this
- removeClass(...classes) => this
- toString => '[object DomElem]'
- empty
- detectTouch
- pointerEventPolyfill(event) => event
- wrapPointerCallback(callback) => ((event) => {})
