# Tabs

A row of tabs, one selected. The arrow keys, Home and End move along it and select as they go, so it is one tab stop in the page's order.

Panels are optional: given one per tab, only the selected tab's shows, and the browser is told which tab controls which panel. Without them, `onChange` says which tab was chosen, for content that's built on demand. A tab can carry a count (unread, items listed), shown beside its label.

```js
new Tabs({
	tabs: [
		{ id: 'chat', label: 'Chat', count: 2 },
		{ id: 'people', label: 'People' },
	],
	panels: { chat: chatList, people: peopleList },
	onChange: ({ value }) => remember('tab', value),
	appendTo: document.body,
});
```

## Usage rules

The [usage rules](../../docs/USAGE_RULES.md) that bear on Tabs: [layout.router-vs-tabs](../../docs/USAGE_RULES.md#page-shell-and-layout), [form.single-choice](../../docs/USAGE_RULES.md#forms).

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `tabs` | `Array<object>` | `[]` | The tabs: `{ id, label, icon, count, disabled }`; reactive, a tab removed hides its panel |
| `selected` | `string` | the first tab | The selected tab's id |
| `panels` | `object` | - | Each tab's panel by id, an element or a Component, shown only while selected |
| `variant` | `'segmented'` | - | A pill split into its choices, for switching between a few views of the same thing |
| `onChange` | `Function` | - | Hears `change` when the selection changes; `event.value` is the selected tab's id |

Selecting the tab that is already selected is not a change. A disabled tab is skipped by the arrow keys and refused by `select()`.

## Methods

```js
tabs.select(id); // selects a tab, showing its panel and announcing change, if it wasn't already selected
tabs.count(id, count); // the count beside a tab's label; zero or nothing clears it
```
