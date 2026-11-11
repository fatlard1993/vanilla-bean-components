# TagList

A list of short text tags that the user adds to by typing and pressing Enter, and removes with each tag's button. Its value is the list of tags, so it is a form field: reach for it for labels, keywords or a pick from a fixed vocabulary, where a Select would allow only one and a comma-separated Input would leave the parsing to you. With `readOnly` it just shows the tags.

## Usage rules

The [usage rules](../../docs/USAGE_RULES.md) that bear on TagList: [form.value-components-in-form](../../docs/USAGE_RULES.md#forms).

## Usage

In a Form it is a field like any other, through `InputComponent`. The Form gives it `value`, hears its `change`, and hands it the field's `validate`:

```js
import { Form, TagList } from '@vanilla-bean/components';

new Form({
	data: { tags: ['co-op'] },
	inputs: [{ key: 'tags', InputComponent: TagList, validate: tags => (tags.length ? null : 'Add at least one tag') }],
});
```

On its own, read the tags from `change` or from `options.value`:

```js
new TagList({ value: ['co-op', 'party'], onChange: ({ value }) => save({ tags: value }) });

new TagList({ readOnly: true, value: game.tags });
```

## Adding and removing

Only Enter (or the add button) turns what is typed into a tag; Enter is claimed, so it doesn't submit a form or dialog around it. A blank entry or one already in the list is quietly dropped. `accept` decides what else counts: return `false` to refuse an entry (it stays in the field, marked with an error), `true` to keep it as typed, or a string to store instead, such as the vocabulary's own spelling. Setting `options.value` from outside redraws the tags without announcing `change`.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Array<string>` | `[]` | The tags; follows every one added or removed |
| `onChange` | `Function` | - | Hears `change` when a tag is added or removed; `event.value` is the new list |
| `readOnly` | `boolean` | `false` | Show the tags only: no field to type in, no remove buttons |
| `accept` | `Function` | - | `(value, tagList) =>` the tag to add, `true` to keep it as typed, or `false` to refuse it |
| `validate` | `Function\|Array<Function>` | - | `tags => message`: what's wrong with the list, or nothing. Checked as it changes and by `validate()`, the message shown below it |
| `suggestions` | `Array<string>` | - | Values offered while typing a new tag |

## Events

- **`change`** - A tag was added or removed; `event.value` is the new list. The word being typed is not a change.
