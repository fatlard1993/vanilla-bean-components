# EmptyState

What a list or view shows when there's nothing in it: an icon, a title, a line saying why or what to do, and the button that does it. Apps were writing this five ways.

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

| Option    | Type                | Default | Description                                                           |
| --------- | ------------------- | ------- | --------------------------------------------------------------------- |
| `icon`    | `string`            | -       | A Font Awesome icon name; none shows nothing                          |
| `title`   | `string`            | -       | The headline                                                          |
| `message` | `string`            | -       | A line under it                                                       |
| `action`  | `object\|Component` | -       | Button options, or a Component of your own, placed under the message  |
| `loading` | `boolean`           | `false` | A spinner in place of the icon while the view's content is on its way |

Each part follows its option, and an empty part takes no room. A view loading its data shows `new EmptyState({ loading: true })`, then sets the title and message, or removes it, once the data is in. It grows to fill a flex parent and centres itself, so it sits in the middle of an emptied view.
