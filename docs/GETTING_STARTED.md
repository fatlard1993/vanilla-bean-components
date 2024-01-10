# Getting Started With vanilla-bean-components

It will help to have a decent understanding of [DomElem](../DomElem/README.md) before starting this. Being that this is primarily a development pattern, I'll simply recommend what I currently do. Feel free to stray from the path wherever makes sense for your use-case.

## HTML

Create an html file with whatever metadata, or remote styles/scripts that you need. Below are the few pieces needed for vanilla-bean-components:

> [example](./demo/index.html)

### Font & icon support

```html
<link rel="stylesheet" href="@fortawesome/fontawesome-free/css/all.css" />
<link rel="stylesheet" href="source-code-pro/source-code-pro.css" />
```

### Augmented UI support

```html
<link rel="stylesheet" href="augmented-ui/augmented-ui.min.css" />
```

### JS Entrypoint

This is the main entrypoint for your app.

```html
<script type="module" src="./index.js"></script>
```

> [example](./demo/index.js)

Not _strictly necessary_, but the `Page` component is designed to represent the top-level component by combining `autoRender: 'onload'`, touch detection, along with some top-level & global styles.

```javascript
new Page({ appendTo: document.body, content });
```

## Build

Now that you have the minimum app structure inplace you'll need some way to get it into the browser. You _can_ use a static build, but since the use-case of this library is more geared towards reactive apps you'll likely have or need a server component to integrate with. In either case I recommend considering [bun](https://bun.sh/), thats what I'm currently using, although you _should_ be able to use whatever else you want.
