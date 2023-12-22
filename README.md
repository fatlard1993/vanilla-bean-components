# vanilla-bean-components

Vanilla JS class-based components

> Based on [DomElem](./DomElem/README.md)

## Usage

All components maintain a [demo](./components/Button/demo.js) & [test file](./components/Button/.test.js) with good examples of how each component can be used. Additionally, there are a set of [examples](./demo/examples) available for reference.

### HTML

> [example](./demo/index.html)

#### Font & icon support

```html
<link rel="stylesheet" href="@fortawesome/fontawesome-free/css/all.css" />
<link rel="stylesheet" href="source-code-pro/source-code-pro.css" />
```

#### Augmented UI support

```html
<link rel="stylesheet" href="augmented-ui/augmented-ui.min.css" />
```

### JS

> [example](./demo/index.js)

```javascript
new Page({
	appendTo: document.getElementById('app'),
	content,
});
```

### Theme

#### Colors

[TinyColor](https://github.com/scttcper/tinycolor)

## Demo

A [demo app](./demo) is included, this offers good examples of library usage and a working visual reference tool for the components.

`bun run demo`

> The server is available @ [localhost:9999](http://localhost:9999)

![demo](./img/demo.png)

## Test

`bun test`
