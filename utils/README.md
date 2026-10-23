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

Standard debounce and throttle. Default delay is 400ms. A debounced function's `cancel()` drops a call still waiting.

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

## Storage

### `readStorage(key, fallback?)` / `writeStorage(key, value)`

localStorage as JSON, without the throws: a missing or unparseable value, or storage the browser refuses (a private window, blocked site data), answers `fallback`, and a refused write is dropped. Writing `undefined` removes the key.

```js
const recent = readStorage('recentColors', []);
writeStorage('recentColors', [color, ...recent]);
```

## Collections

### `crudResource(path, options?)`

The client half of the app kit's [`crudRoutes`](../app/README.md#crudroutespath-store--list-): hypertether's `resource` for the collection served at `path` (`list`, `read`, `create`, `update`, `delete`, each resolving to a hypertether result, writes refetching the reads), with an `update` that understands a `versioned` store. `options` go to `resource` (`apiId`, `invalidates`, options for the reads).

An update sent with an older `_v` is refused with 409, `_conflict` and the stored record; it comes back as the result's `conflict`: `{ current, changes, fields }`, `fields` being `{ key, ours, theirs }` for each field sent that the stored record holds otherwise. If no field differs, the update is sent again over the stored `_v` without asking. Otherwise `onConflict(conflict)` may answer with the fields to send instead, sent over the stored `_v` (up to three times), or with nothing, leaving the conflict to the caller. Any other failure, a 404's `{ error: 'Not found' }` among them, is hypertether's result as it came, for `failureReason`.

```js
import { crudResource, failureReason } from '@vanilla-bean/components';

const games = crudResource('/api/games');

games.list({ onResponse: ({ body }) => (table.options.data = Object.values(body)) }); // refetched after each write

const saved = await games.update(game.id, {
	body: { name, players, _v: game._v },
	// Only the name goes over their version; return nothing instead to leave the conflict to the code below
	onConflict: ({ changes }) => ({ name: changes.name }),
});

if (saved.conflict) notify(`Changed meanwhile: ${saved.conflict.fields.map(({ key }) => key).join(', ')}`);
else if (saved.status === 'error') notify(failureReason(saved));
```

## Socket

### `connectSocket(path?, { onLost?, onRestored? }?)`

A WebSocket that comes back. A dropped connection is retried for as long as it's open, backing off to every 10 seconds, and at once when the page comes back into view or the network comes back. Listeners carry over to each new connection. `onLost` and `onRestored` are called once per outage, for a notice of your own.

```js
const socket = connectSocket('/ws', { onLost: () => lost.show(), onRestored: () => lost.hide() });

const stop = socket.onMessage(data => update(data)); // JSON is parsed; anything else comes as it is
socket.send({ type: 'move', x, y }); // false while disconnected: nothing is queued
socket.close(); // for good
```

A path is this host's, over `wss:` on an https page; a full `ws:`/`wss:` URL is used as it is.

## Random

### `rand(min?, max?)` / `randInt(min?, max?)` / `randFromArray(array)`

```js
rand(0, 1); // float in [0, 1)
randInt(1, 6); // integer in [1, 6]
randFromArray(['a', 'b', 'c']); // random element
```

### `shuffleArray(array)` / `chance(percentage?)` / `weightedChance(percentages)`

```js
shuffleArray(deck); // the same array, reordered
chance(25); // true a quarter of the time
weightedChance({ common: 70, rare: 25, legendary: 5 }); // a key, as likely as its percentage; they must sum to 100
```

## Color

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

### `cssLength(value)`

A number as pixels, anything else as given: `cssLength(12)` is `'12px'`, `cssLength('1rem')` is `'1rem'`. For an option that takes either.

## Gesture

### `pointerGesture({ down?, move?, up?, throttle? }?)`

Follows a gesture of one or more pointers, from the first `pointerdown` to the last pointer's release. Hand it each pointerdown with `start(event)`: the first pointer starts the gesture and is its `initiator`, later ones join. Moves and releases (`pointerup`, `pointerleave`, `pointercancel`) are heard on the document, so a pointer that strays off the element keeps going.

```js
const gesture = pointerGesture({
	down: event => ({ from: event.clientX }), // each pointer's state
	move: (event, pointer) => drag(event.clientX - pointer.from),
	up: (event, pointer) => drop(pointer),
	throttle: 60, // or a function, read as each gesture starts
});

canvas.addEventListener('pointerdown', event => gesture.start(event));
```

`gesture.pointers` holds each pointer's state by `pointerId`, `count` is how many are down, and `active` whether a gesture is under way. `clear()` forgets them all and ends it without an `up`. ColorPicker and Whiteboard are built on it.

## Browser

### `copyToClipboard(text)` / `readClipboard()`

Clipboard read/write. `copyToClipboard` returns `true` on success.

### `vibrate(durationPattern?)` / `tactileResponse()`

Haptic feedback on mobile. `tactileResponse` is a 30ms pulse shorthand.

### `isMac()`

Whether the device is a Mac, an iPhone or an iPad. Useful for displaying ⌘ vs Ctrl keybindings.

### `isDev`

`true` outside production bundles. Guards dev-only warnings.

### `requestWakeLock()`

Keeps the screen awake, taking the lock again each time the page comes back into view (the browser drops it while the page is hidden). Returns a function that lets the screen sleep again. Does nothing where unsupported.

```js
const release = requestWakeLock(); // a game in play
release(); // the game is over
```

### `fitToKeyboard({ setHeight? })`

Keeps the page to the part a phone's keyboard leaves showing, which on iOS covers the bottom of the page rather than shrinking it. Writes the visible height to `--visible-height` and, unless `setHeight: false`, sizes the document to it; leaves the page alone while pinch-zoomed. Returns a function that stops.

## Date

### `parseDate(value)`

A `Date` from a Date, a timestamp or a string, or `null`. A date-only string such as `'2026-10-18'` is that day where the reader is; `new Date('2026-10-18')` is midnight UTC, the day before anywhere west of Greenwich.

### `formatDate(value, { locale?, ...intlOptions })`

A date for reading, in the reader's locale, with the same date-only rule. Text that isn't a date comes back as written, and nothing comes back as `''`.

```js
formatDate('2026-10-18'); // '10/18/2026' in en-US, in any time zone
formatDate(entry.at, { month: 'short', day: 'numeric' }); // 'Oct 18'
```

### `relativeTime(value, now?)`

Briefly how long ago, or ahead: `'just now'`, `'5m ago'`, `'3h ago'`, `'2d ago'`, `'in 10m'`.

## File

### `fileAccepted(file, accept)`

Whether a file matches an accept list as `<input type="file" accept>` reads it: extensions (`.csv`), types (`application/json`) and families (`image/*`). An empty list accepts anything.

### `readFile(file, as?)`

A file's contents as `'text'` (default), `'json'`, `'dataURL'` or `'arrayBuffer'`.

## Class

### `buildClassList(...classNames)`

Flatten nested arrays, filter falsy values, and produce a list of class names. Used internally by `addClass`.

```js
buildClassList('btn', isActive && 'active', null, ['size-lg']); // → ['btn', 'active', 'size-lg']
```

### `classSafeNanoid(size?)`

Generates a nanoid that is safe to use as a CSS class name: no leading digits, no special characters.
