# vanilla-bean-components

> Class based JS components based on [DomElem](./DomElem/README.md). A pattern focused on improving the development experience surrounding the component concept.

> This is a personal project and is currently under active development, everything is subject to change. Its current state reflects my current opinions as much as time allows within the confines of work and life responsibilities.

This repo can be re-themed, and extended as-is. But another great way to leverage this pattern is to clone/fork this repo and own it, completely cut/replace/rebuild components and theme to fit your exact needs, build your own component library, or even implement the pattern directly in your app.

## Goal

Prove that scalable, reactive component patterns like the ones promoted within frameworks like React/Angular/Vue/Svelte/Etc can be achieved with a development pattern and little to no dependencies.

Projects with similar goals or results:

- [ArrowJS](https://github.com/justin-schroeder/arrow-js)
- [HTMX](https://github.com/bigskysoftware/htmx)
- [VanJS](https://github.com/vanjs-org/van)
- [RawJS](https://github.com/squaresapp/rawjs)
- [Alpine.js](https://github.com/alpinejs/alpine)
- [uHTML](https://github.com/WebReflection/uhtml)

### My Opinions

> Obviously my personal experience and use-cases color my opinion, which in turn results in deviation from the paths others have forged. Those working opinions are [here](./docs/ETHOS.md) if you're interested.

## Result

- A Proxy based observable state utility
- A css in js solution leveraging postcss
- A Class interface wrapping an HTMLElement, observable state, and a handful of common utilities for interaction and manipulation
- A bunch of re-usable Components for common interfaces
- A demo server and suite of demos and examples to illustrate the usage and benefits of the pattern

## Demo

A [demo app](./demo/README.md) is included, this offers good examples of library usage and a working visual reference tool for the components.

`bun run demo`

![demo](./img/demo.png)

## Usage

All components maintain a [README](./components/Button/README.md) &[demo](./components/Button/demo.js) & [test file](./components/Button/.test.js) which offer good examples of how each component can be used. Additionally, there are a set of [examples](./demo/examples) available for reference. The entire [demo app](./demo/README.md) is built on bun and vanilla-bean-components which serves a second purpose as its own full-stack example.

> Read the [Getting Started](./docs/GETTING_STARTED.md) doc when you're ready to start your own project with vanilla-bean-components.

### Examples

Examples are a great way to get a feel for building with this pattern:

- [Blog](./demo/examples/Blog.js)
- [Bomb Game](./demo/examples/BombGame.js)
- [Calculator](./demo/examples/Calculator.js)
- [Counter](./demo/examples/Counter.js)
- [DLC Whiteboard](./demo/examples/DlcWhiteboard.js)
- [Multi Widget](./demo/examples/MultiWidget.js)
- [Shape Match Game](./demo/examples/ShapeMatchGame.js)
- [Stopwatch](./demo/examples/Stopwatch.js)
- [Todo](./demo/examples/Todo.js)

### Components

All the components are based on [DomElem](./DomElem/README.md), so check that out for more details. But heres one way to use it:

```javascript
const input = new DomElem({
	tag: 'input',
	value: 'Some text',
	onChange: ({ value: newValue }) => {
		input.options.value = newValue;
	},
	appendTo: document.body,
});

new DomElem({
	tag: 'p',
	textContent: input.options.subscriber('value', value => `The current value is: ${value}`),
	appendTo: document.body,
});
```

### Theme

The theme defines common/global/constant styles. The theme is loaded through context so that it can be modified/replaced.

#### Theme Usage

> The styles functions use [postcss](https://github.com/postcss/postcss), with the plugins: [autoprefixer](https://github.com/postcss/autoprefixer), and [postcss-nested](https://github.com/postcss/postcss-nested)

styles()

```javascript
new DomElem({
	styles: theme => `
		color: ${theme.colors.red};
	`,
});
```

styled

```javascript
const RedOne = styled(
	DomElem,
	theme => `
		color: ${theme.colors.red};
	`,
);
```

context

```javascript
import { context } from 'vanilla-bean-components';

console.log(context.domElem.theme);
```

#### Colors

The [colors](./theme/colors.js) in this theme use [TinyColor](https://github.com/scttcper/tinycolor)
