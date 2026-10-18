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

| Option    | Type                | Default | Description                                                          |
| --------- | ------------------- | ------- | -------------------------------------------------------------------- |
| `icon`    | `string`            | -       | A Font Awesome icon name; none shows nothing                         |
| `title`   | `string`            | -       | The headline                                                         |
| `message` | `string`            | -       | A line under it                                                      |
| `action`  | `object\|Component` | -       | Button options, or a Component of your own, placed under the message |

Each part follows its option, and an empty part takes no room. It grows to fill a flex parent and centres itself, so it sits in the middle of an emptied view.
