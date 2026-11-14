# EmptyState

What a list or view shows when there's nothing in it: an icon, a title, a line saying why or what to do, and the button that does it. Apps were writing this five ways.

## Usage rules

The [usage rules](../../docs/USAGE_RULES.md) that bear on EmptyState: [overlay.emptystate-options](../../docs/USAGE_RULES.md#overlays-and-feedback), [overlay.emptystate-four-states](../../docs/USAGE_RULES.md#overlays-and-feedback), [overlay.emptystate-failed](../../docs/USAGE_RULES.md#overlays-and-feedback), [overlay.emptystate-empty-vs-nomatch](../../docs/USAGE_RULES.md#overlays-and-feedback), [overlay.notify-not-progress](../../docs/USAGE_RULES.md#overlays-and-feedback).

## Usage

```js
import { EmptyState } from '@vanilla-bean/components';

new EmptyState({
	icon: 'seedling',
	title: 'No fields yet',
	message: 'Fields you draw on the map show up here.',
	action: { textContent: 'Draw a field', onPointerPress: startDrawing },
});
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `string` | - | A Font Awesome icon name; none shows nothing |
| `title` | `string` | - | The headline |
| `message` | `string` | - | A line under it |
| `action` | `object\|Component` | - | Button options, or a Component of your own, placed under the message |
| `loading` | `boolean` | `false` | A spinner in place of the icon while the view's content is on its way |
| `progress` | `number` | - | How far a long load has come, 0 to 1, as a bar under the message; named by the title |

Each part follows its option, and an empty part takes no room. A view loading its data shows `new EmptyState({ loading: true })`, then sets the title and message, or removes it, once the data is in. A load long enough to wait through says how far it has come: `new EmptyState({ loading: true, title: 'Loading the map', progress: 0.4 })`, with `progress` updated as it goes. It grows to fill a flex parent and centres itself, so it sits in the middle of an emptied view.
