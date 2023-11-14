# DomElem

Vanilla JS class-based component building block

## Usage

```javascript
new DomElem(options, ...children);
```

### One-Off Elements

```javascript
new DomElem({
	tag: 'p',
	textContent: 'A general purpose base element building block',
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

## Options

Everything in a DomElem can be controlled by its `options`. In addition to configuration, `options` offers access to properties, methods, and events of the DomElem class and its base HTMLElement.

Class instance property `options` is a Proxy. All `set` operations run through `setOption`.

- ...[HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)
- DomElem options
  - @param {String} tag - The HTML tag
  - @param {Boolean} autoRender - Automatically render the component when constructed
  - @param {Set} knownAttributes - options to send to elem.setAttribute
  - @param {Set} priorityOptions - options to process first when processing a whole options object
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
- setOptions(options)
- hasClass(...classes) => Boolean
- addClass(...classes) => this
- removeClass(...classes) => this
- toString => '[object DomElem]'
- empty
- ancestry(targetClass) => []
- detectTouch
- pointerEventPolyfill(event) => event
- wrapPointerCallback(callback) => ((event) => {})
