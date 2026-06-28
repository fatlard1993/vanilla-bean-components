# Utils

General-purpose utility functions shared across components. All are available as named exports from the top-level package.

```js
import { debounce, orderBy, toCamelCase } from '@vanilla-bean/components';
```

## String

### `capitalize(string, recursive?, split?)`

Capitalizes the first letter of each word. Set `recursive` to also capitalize after digits. `split` defaults to a space.

```js
capitalize('hello world'); // → 'Hello World'
capitalize('step1thing', true); // → 'Step1Thing'
```

### `toCamelCase(string, splitter?)` / `fromCamelCase(string, joiner?)`

Round-trip between prose and camelCase.

```js
toCamelCase('component options'); // → 'componentOptions'
fromCamelCase('componentOptions'); // → 'component options'
```

### `toPascalCase(string)`

Like `toCamelCase` but capitalizes the first word too. Useful for generated class names.

```js
toPascalCase('my component'); // → 'MyComponent'
```

### `removeExcessIndentation(string)`

Strips the minimum common leading whitespace from every line. Useful for cleaning up indented template literals before rendering.

## Data

### `orderBy(orders)`

Returns an `Array.sort` comparator. `orders` is a single `{ property, direction }` object or an array of them for multi-key sorting.

```js
items.sort(orderBy({ property: 'name', direction: 'asc' }));
items.sort(
	orderBy([
		{ property: 'group', direction: 'asc' },
		{ property: 'name', direction: 'asc' },
	]),
);
```

### `debounce(callback, delay?)` / `throttle(callback, delay?)`

Standard debounce and throttle. Default delay is 400ms.

```js
const save = debounce(value => api.save(value), 300);
const onScroll = throttle(() => updatePosition(), 100);
```

### `delay(ms)`

A promise that resolves after `ms` milliseconds.

```js
await delay(500); // pause for 500ms
```

### `retry(callback, options?)`

Retries an async function on failure. Options: `{ attempts, interval }`.

```js
const data = await retry(() => fetch('/api/data'), { attempts: 3, interval: 1000 });
```

### `convertRange(value, sourceRange, targetRange)`

Maps a number from one numeric range to another.

```js
convertRange(0.5, [0, 1], [0, 100]); // → 50
convertRange(128, [0, 255], [0, 1]); // → 0.502
```

### `conditionalList(items)`

Builds a flat array from `{ if, thenItem, alwaysItem }` entries, keeping only those where `if` is truthy. Used internally for conditional component content.

```js
conditionalList([
	{ alwaysItem: 'home' },
	{ if: isLoggedIn, thenItem: 'dashboard' },
	{ if: isAdmin, thenItem: 'settings' },
]); // → ['home', 'dashboard'] when isLoggedIn, not isAdmin
```

### `getCustomProperties(object)`

Returns all own enumerable properties of an object, excluding prototype members.

## Random

### `rand(min?, max?)` / `randInt(min?, max?)` / `randFromArray(array)`

```js
rand(0, 1); // float in [0, 1)
randInt(1, 6); // integer in [1, 6]
randFromArray(['a', 'b', 'c']); // random element
```

## Color

### `stringToColor(string, config?)`

Deterministic color from any string. Same input always produces the same hue. Useful for avatars or tag coloring.

```js
stringToColor('alice'); // always the same hue for 'alice'
stringToColor('bob'); // different but stable hue
```

### `rgbDelta(rgbA, rgbB)`

Perceptual distance between two RGB arrays `[r, g, b]`. Used internally by ColorPicker to score color accuracy in ShapeMatchGame.

```js
rgbDelta([255, 0, 0], [200, 0, 0]); // → ~55
```

## Element

### `isDescendantOf(element, parentElement)`

Whether `element` is anywhere inside `parentElement` in the DOM tree.

### `getElementsContainingText(text, options?)`

Returns all DOM elements whose visible text content matches `text`. Useful for testing and demo navigation.

## Browser

### `copyToClipboard(text)` / `readClipboard()`

Clipboard read/write. `copyToClipboard` returns `true` on success.

### `vibrate(durationPattern?)` / `tactileResponse()`

Haptic feedback on mobile. `tactileResponse` is a 30ms pulse shorthand.

### `isMac()`

Whether the current user agent is macOS. Useful for displaying ⌘ vs Ctrl keybindings.

### `isDev`

`true` outside production bundles. Guards dev-only warnings.

## Class

### `buildClassList(...classNames)` / `buildClassName(...classNames)`

Flatten nested arrays, filter falsy values, and produce a class name list or space-joined string. Used internally by `addClass`.

```js
buildClassName('btn', isActive && 'active', null, ['size-lg']); // → 'btn active size-lg'
```

### `classSafeNanoid(size?)`

Generates a nanoid that is safe to use as a CSS class name: no leading digits, no special characters.
