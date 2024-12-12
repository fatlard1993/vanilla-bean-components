# Elem

An Element (`Elem` class) is a small wrapping layer around createElement and its resulting HTMLElement object. You can think of it like a little toolbox that comes with every element.

## Usage

```js
new Elem(options, ...children);
```

```js
new Elem({
	tag: 'p',
	textContent: component.options.subscriber('value', value => `The current value is: ${value}`),
	appendTo: document.body,
});
```

## Options & methods

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

## Additional Methods

Not all Elem methods make sense to use with options:

- `setOption(key, value)`
  - _This method is used internally to synchronize options property changes and not intended to be called directly_
- `setOptions(options)`
- `hasClass(...classes) => Boolean`
- `addClass(...classes) => this`
- `removeClass(...classes) => this`
- `toString => '[object Elem]'`
- `empty`
