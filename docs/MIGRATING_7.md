# Migrating to 7.0

7.0 is a clean break: old names are gone, with no deprecated aliases. Every rename below fails loudly (an enum throws, a method is undefined) or quietly (an option nothing reads any more), so search for each **before** name. Each entry's **Apps** line says where it was found when 7.0 was cut, counted by occurrences in each app's own source (not its dependencies or build output).

The vocabulary 7.0 settles on:

| Concern | One name | Rule |
| --- | --- | --- |
| A press | `onPointerPress` | What is pressed takes `onPointerPress`. A container that hears a press on any of its parts names the part: Dialog's `onButtonPress`, Menu's `onItemPress`. A part's own handler runs first. |
| A change | `onChange(event)`, `event.value` | Every component's change is an event carrying the new value as `event.value`. |
| An overlay | `open()`, `close()`, `isOpen`, `autoOpen`, `onClose` | Dialog, Popover (so Tooltip, ContextMenu, Notify) and BottomSheet open and close by the same names, and announce closing as a declared `close` event, however they closed. |
| A status | `intent` | `'info'`, `'success'`, `'warning'`, `'danger'`: the color roles of the same names. `error` is `danger` everywhere. |
| A look | `variant` | Only how something is drawn (`flat`, `chip`, `segmented`, `bar`), never what it means. |
| A check | `validate: value => message` | What's wrong, in words, or nothing. One shape for an Input, a Form field, a TagList and a store field; the message shows below the field. |
| A keyboard press | `pressable` | Anything pressed by pointer is pressed by Enter and Space too, as the same click. |

## Notify

### `type` is `intent`, and `error` is `danger`

```js
// before
new Notify({ type: 'error', content: 'Could not save' });
new Notify({ type: 'success', content: 'Saved' });

// after
new Notify({ intent: 'danger', content: 'Could not save' });
new Notify({ intent: 'success', content: 'Saved' });
```

The toast's class is `intent-danger` (was the bare `error`), for an app that styles toasts by it.

Apps: paude 59, land-ledger 44, void-driller 38, humanity 10, home-page 9, web-game-framework 7, sorcery-and-savagery 3. Of those, `type: 'error'`: paude 20, land-ledger 19, void-driller 18, home-page 8, humanity 7, web-game-framework 4, sorcery-and-savagery 3. (Counted as `type: '<status>'` lines; check each is a Notify.)

### An action's `onPress` is `onPointerPress`

Same signature, `(notify, event)`, and the same behaviour: it may be async, and the toast closes once it settles unless it returns `false`.

```js
// before
actions: [{ textContent: 'Undo', onPress: restore }];

// after
actions: [{ textContent: 'Undo', onPointerPress: restore }];
```

Apps: paude 3 (sessionActions, FileManager), home-page 1 (deleteWithUndo), land-ledger 1 (liveSync).

### `show()` and `hide()` are `open()` and `close()`

```js
// before
progress.hide();

// after
progress.close();
```

A dismissal (a press, the timeout, `destroy()`) announces `close`, so `onClose` hears it.

Apps: paude 1 (FileManager's upload progress).

## Dialog

### `variant` is `intent`, and `error` is `danger`

```js
// before
Dialog.confirm({ variant: 'warning', header: 'Discard changes?', confirmLabel: 'Discard' });
dialog.options.variant = 'error';

// after
Dialog.confirm({ intent: 'warning', header: 'Discard changes?', confirmLabel: 'Discard' });
dialog.options.intent = 'danger';
```

Its class is `intent-<value>` (was `variant-<value>`).

Apps: game-night 2 (GamePage, confirmDeleteGame).

### `openOnRender` is `autoOpen`

Same values: `true` (the default, 16ms), a delay in milliseconds, or `false` to open with `open()`.

```js
// before
new Dialog({ openOnRender: false });

// after
new Dialog({ autoOpen: false });
```

Apps: none found.

### `open(modal)` takes an options object

```js
// before
dialog.open(false);

// after
dialog.open({ modal: false });
```

`dialog.isOpen` is new. Apps: none found calling `open` with an argument.

### A button entry's own `onPointerPress` runs, then `onButtonPress`

Before, an entry in `buttons` carrying its own `onPointerPress` replaced the dialog's handler, so `onButtonPress` never heard that button. Now both run, the button's first. `onButtonPress` also receives `dialog`.

```js
new Dialog({
	buttons: ['Cancel', { textContent: 'Delete', intent: 'danger', onPointerPress: () => track('delete') }],
	onButtonPress: ({ button, closeDialog }) => closeDialog(),
});
```

Apps using `onButtonPress` (unchanged, listed to check for entries with their own `onPointerPress`): land-ledger 14, void-driller 4, game-night 2, humanity 2, paude 2, web-game-framework 2, home-page 1, sorcery-and-savagery 1.

## Button

### `intent` is new

A button can say what pressing it does, in a status role: a filled button takes it as its fill, a flat or chip one as its text. The Dialog README's `{ text: 'Confirm', variant: 'success' }` never worked (`variant` takes only a look, and `text` isn't an option); it is `{ textContent: 'Confirm', intent: 'success' }`.

```js
new Button({ textContent: 'Delete', intent: 'danger', onPointerPress: remove });
```

## Popover, Tooltip and ContextMenu

### `show()` and `hide()` are `open()` and `close()`

`open()` takes the same placement options `show()` did: `{ x, y, maxWidth, maxHeight }` for a Popover or Notify, `{ x, y }` or `{ anchor }` for a ContextMenu.

```js
// before
menu.show({ x: event.clientX, y: event.clientY });
menu.show({ anchor: button });
menu.hide();

// after
menu.open({ x: event.clientX, y: event.clientY });
menu.open({ anchor: button });
menu.close();
```

A subclass that overrode `show`/`hide` overrides `open`/`close` and calls `super.open(options)`/`super.close()`.

Apps: home-page 3 (Bookmarks, BookmarksToolbar), game-night 2 (Games, GamesToolbar) plus MultiselectFilter, a Popover subclass that calls `this.show`, `super.show(options)` and `this.hide()`; paude 2 (menu.js); void-driller 1 (Achievement, a Popover subclass, `this.hide()`).

### ContextMenu's `shown` is `isOpen`

```js
// before
if (menu?.shown) menu.hide();

// after
if (menu?.isOpen) menu.close();
```

Apps: paude 1 (menu.js). Popover's `isOpen` now tracks `open()`, `close()` and the platform's own toggles, rather than matching `:popover-open`.

### Closing is a `close` event

Every way a Popover closes (`close()`, a press outside, a light dismiss, `destroy()`) announces `close`, once per opening, so `onClose` works as an option.

### `autoOpen` takes a delay

`autoOpen: 500` opens half a second after it's added to the page; `true` is still 200ms.

Apps: game-night 1 (`autoOpen: false`, unchanged).

## BottomSheet

Rebuilt on `<dialog>`: a modal, with its role, the inert page behind it and Escape from the browser. Focus moves into it on opening and back on closing; the drag follows one pointer path for mouse, touch and pen.

```js
// before
const sheet = new BottomSheet({ onClose: () => (_sheet = null) });
sheet.show();
sheet.hide();
if (sheet.elem.classList.contains('open')) ...

// after
const sheet = new BottomSheet({ onClose: () => (_sheet = null) });
sheet.open();
sheet.close();
if (sheet.isOpen) ...
```

- `onClose` is now the declared `close` event: it gets the event, and hears every way out (`close()`, Escape, a press on the dimmed page, a drag, navigating away).
- The `open` class is gone; style an open sheet with `[open]`.
- Being modal, the page behind it can't be pressed while it's open; a press there closes it.
- Children given to the constructor land in `sheet.body`, where they scroll, as `body` always promised.
- `autoOpen` (default `false`) is new.

Apps: land-ledger 5 (QuickLog: `new BottomSheet`, `sheet.show()`, `sheet.hide()` twice, `_sheet.hide()`).

## Tabs

### `onChange(id, tabs)` is `onChange(event)`, with the id as `event.value`

```js
// before
new Tabs({ tabs, onChange: id => this.showTab(id) });

// after
new Tabs({ tabs, onChange: ({ value }) => this.showTab(value) });
```

It is the `change` event, so `tabs.on({ targetEvent: 'change', ... })` hears it too.

Apps: paude 3 (NotesPanel, GitPanel, SessionBrowser), land-ledger 1 (Timeline), pain-map 1 (PainMapToolbar).

## Menu

### `onSelect` is `onItemPress`, and the detail names the item

```js
// before
new Menu({ items, onSelect: ({ detail: { target } }) => open(target.textContent) });

// after
new Menu({ items, onItemPress: ({ detail: { item, event } }) => open(item.textContent) });
```

`item` is the menu's own row (its `<li>`), however deep in it the press landed; `event` is the press. Apps: none found.

## Keyboard

### `onKeyDown(cb)`, `onKeyUp(cb)` and `onKeyPress(cb)` methods are gone

The key events are declared events: take them as options, through `on()`, or with `addEventListener` and a signal.

```js
// before
const stop = keyboard.onKeyPress(handle);
stop();

// after
new Keyboard({ onKeyPress: handle });
// or
keyboard.on({ targetEvent: 'keyPress', callback: handle });
// or, ending with something else
keyboard.elem.addEventListener('keyPress', handle, { signal: this.signal });
```

Apps: none found calling the methods (htpc-remote passes `onKeyPress` as an option, unchanged).

## Component

### `classEnum` draws an option as one class of a set

The six hand-copied variant setters are one schema helper. A subclass of yours with the same shape can use it:

```js
// before
static schema = {
	variant: {
		enum: ['flat', 'solid'],
		set(value) {
			this.removeClass(/\bvariant-\S+\b/g);
			if (value) this.addClass(`variant-${value}`);
		},
	},
};

// after
import { classEnum } from '@vanilla-bean/components';

static schema = { variant: classEnum('variant', ['flat', 'solid']) };
```

A subclass that only presets a default (`variant: { default: 'bar' }`) keeps working as it is.

### Types describe `static schema`, `static events` and `static prepareOptions`

`index.d.ts` no longer declares the retired `static handlers`; it declares the three statics 2.x reads, and `SchemaDescriptor`, `signal`, `optionEnum` and `onLongPress`. Apps: none use `static handlers`.

### `utils` gains `firstFocusable(root)`

The first element in a root that takes keyboard focus; Dialog and BottomSheet move focus to it on opening.

## Input, Form and Select

### `validations: [[test, message]]` is `validate: value => message`

A validator returns what's wrong, in words, or nothing (`null`, `undefined`, `false`, `''`) when the value is fine: the opposite polarity to a `validations` test, which returned true for valid. Give one, or a list. It is the one shape everywhere: an Input's, a Select's, a TagList's, a Form field's, and a server `createStore` field's, so one function can check a field on both sides of the wire.

```js
// before
new Input({
	validations: [
		[/.+/, 'Required'],
		[value => value !== 'New', value => `Must not be reserved name: ${value}`],
	],
});
{ key: 'name', validations: [[/.+/, 'Required']] }

// after
new Input({
	validate: [value => (value ? null : 'Required'), value => value === 'New' && `Must not be reserved name: ${value}`],
});
{ key: 'name', validate: value => (value ? null : 'Required') }
```

- `input.validate({ validations, value })` is `input.validate({ value })`; it still returns the messages, or `undefined`.
- What's wrong is written below the field in the `danger` color and read out with it (`aria-describedby`), with `aria-invalid` and the `validation-errors` class on the field. The red "!" button and its popover are gone.
- A Form field's `validate` keeps its shape, and its message now shows: before, it only reddened the field. A field whose component has its own `validate()` (Input, Select, TagList) is given it and checks as it changes; any other is checked by `hasErrors()`.
- `InputValidationError` and `updateValidationErrors` are gone from the root.

Apps (`validations`): home-page 7 (BookmarkForm, SearchEngineDialog, CategoryDialog), land-ledger 6 (watchFormConflicts, which appends a `[() => false, 'Server has: …']` tuple to `input.options.validations`: it becomes `() => 'Server has: …'` appended to `[input.options.validate].flat()`), pain-map 3, humanity 3, htpc-remote 2 (settings' shared `speed` list), sorcery-and-savagery 2, game-night 1. Form fields already using `validate` (land-ledger 11, pain-map 1) need no change and now show their message.

### A store field takes `validate` too

```js
const named = name => (name.trim() ? null : 'Give it a name');

createStore({ db, collection: 'games', fields: { name: { type: 'string', validate: named } } }); // refuses '  ' with 'name: Give it a name'
new Form({ inputs: [{ key: 'name', validate: named }] }); // shows 'Give it a name' below the field
```

New; apps: none to change.

## TagList

### `tags` is `value`, and a change is `onChange(event)`

The tags are the TagList's `value`, kept as tags are added and removed, so it works as a Form field (`InputComponent: TagList`). A tag added or removed announces `change` with the new list as `event.value`; a value set from outside is shown without announcing.

```js
// before
const tagList = new TagList({ tags: game.tags });
const tags = Array.from(tagList.elem.querySelectorAll('li[data-value]')).map(el => el.dataset.value);

// after
const tagList = new TagList({ value: game.tags, onChange: ({ value }) => save({ tags: value }) });
const tags = tagList.options.value;
```

A refused entry (`accept` returning false) says so below the list until it's changed, as a field's error does. A Tag's remove button calls its `onRemove` (the TagList's) and destroys itself only without one.

Apps: game-night 4 (GameForm's `tags` twice, one through RelatedGamesInput, a TagList subclass; GameCard; GamePage), plus GameForm's `getTags()` and `getRelated()`, which read `li[data-value]` (still drawn, but `options.value` is the list).

## Calendar

### `selectDay`, `selectTime` and `selectEvent` are `dayPress`, `timePress` and `eventPress`

```js
// before
calendar.on({ targetEvent: 'selectDay', callback: ({ detail: { date } }) => open(date) });
calendar.on({ targetEvent: 'selectEvent', callback: ({ detail: { index } }) => edit(events[index]) });

// after
new Calendar({
	onDayPress: ({ detail: { date, isTitle } }) => open(date),
	onTimePress: ({ detail: { date } }) => create(date),
	onEventPress: ({ detail: { data, calendarEvent } }) => edit(data),
});
```

- `timePress` carries `{ date, target }` (was the raw click).
- `eventPress` carries `{ calendarEvent, data, target }`: `data` is the object the event was given as, so an id on it comes back; the undocumented `index` (read from the event's own `index`) is gone. A press on an event is the event's only: it no longer also reaches its day as `dayPress`. A press on a day's title announces `dayPress` once, with `isTitle` (it announced twice).
- Days, half hours and events press by keyboard: Tab reaches the month grid (or the week, or the day's half hours) once, the arrow keys, Home and End move, Enter or Space presses.

Apps: none use Calendar.

### Its date helpers are utils, written in the reader's locale

`DAYS`, `MONTHS`, `toNth`, `to12hour`, `getDaysInMonth`, `formatTime` and `formatDuration` are gone from the root. `utils` has `formatTime(value, { locale?, ...intlOptions })`, `formatDuration(milliseconds)` and `daysInMonth(year, month)`; month and weekday names come from `formatDate`.

```js
// before
`${MONTHS[date.getMonth()]} ${date.getDate()}${toNth(date.getDate())}`; // 'October 23rd'
formatTime(date, { display24h: true });
formatDuration(ms, ', ');
getDaysInMonth(year, month).numberOfDays;

// after
formatDate(date, { month: 'long', day: 'numeric' }); // 'October 23' in en-US
formatTime(date, { hour12: false });
`, ${formatDuration(ms)}`;
daysInMonth(year, month);
```

The Calendar's titles and times follow: `October 23, 2026` (was `October 23rd, 2026`), a week `October 18 – 24, 2026`, an event `6:03 PM, 1h` (was `6:03PM, 1h`).

Apps: none (paude's and land-ledger's `MONTHS` are their own).

### Its toolbar is the library's; CalendarEvent is a record

- The view switch is a segmented Tabs (`role="tablist"`, the selected tab `aria-selected`): the `.set-day`/`.set-week`/`.set-month` buttons and their `pressed` class are gone. Navigating redraws the view, not the toolbar, so the button pressed keeps focus.
- `CalendarEvent` keeps the caller's object as `data` (was `options`), and has no `render()`: the Calendar draws it, once per day it falls on, with `calendar.renderEvent(calendarEvent, container)`.

Apps: none.

## FormDialog

### Its buttons are known by `data-action`, not by label

FormDialog compared a pressed button's label with `saveLabel`, `deleteLabel` and `cancelLabel`. Its own buttons now carry `data-action` (`save`, `delete`, `cancel`); a dialog that lists its own `buttons` marks the ones FormDialog should act on, and a bare label is the app's own button, heard by `onButtonPress`.

```js
// before
buttons: ['Save', 'Mark Resolved', 'Delete', 'Cancel'],

// after
buttons: [
	{ textContent: 'Save', 'data-action': 'save' },
	'Mark Resolved',
	{ textContent: 'Delete', 'data-action': 'delete' },
	{ textContent: 'Cancel', 'data-action': 'cancel' },
],
```

`saveLabel`, `deleteLabel` and `cancelLabel` still name the default buttons. Apps: land-ledger 1 (IncidentDialog, whose Save, Delete and Cancel would otherwise do nothing). Those that only rename a label (pain-map RerateDialog, game-night LoginDialog) need no change.

### Deleting is confirmed in the `danger` intent

The confirmation `confirmDelete` opens was `intent: 'warning'`; it is `'danger'`, drawn in red. A `confirmDelete` object can still set its own `intent`. Apps using `confirmDelete`: check the look only.

## Page

### No constructor: the `autoRender` given is kept, and stylesheets load when it renders

Page overrode any `autoRender` with `'onload'`; `'onload'` is now its default, and `autoRender: true` or `false` is honoured. The library's stylesheets and `styleSheets` are added when the page renders (with `'onload'`, as the window finishes loading) rather than as it is constructed, each once. Apps: none pass `autoRender` to a Page.

## Button, Card and Component

### Enter and Space press anything pressable as a click

`pressable: true` (or `component.pressable()`) makes an element press like a button: a tab stop with the button role, Enter pressing as it goes down (once, however long it's held) and Space as it comes up, each as a click, so `onPointerPress` hears the keyboard too. A Button on another tag, a Card with `onPointerPress`, Calendar's cells and a file Input's drop zone all press this way.

```js
new Component({ addClass: 'tile', pressable: true, onPointerPress: open });
```

What changes for a handler: a keyboard press reaches `onPointerPress` as a `click` (was the key event, on keyup for a Button and keydown for a Card), so `event.key` and `event.code` are gone from it. A Button on another tag now also gets `role="button"` and a tab stop. Apps: none read the key in a Card's or Button's `onPointerPress`.

## utils and the app kit

### Gone from the root

| Gone                                             | Instead                                             |
| ------------------------------------------------ | --------------------------------------------------- |
| `chance(percentage)`                             | `Math.random() * 100 < percentage`                  |
| `weightedChance(percentages)`                    | The app's own (it's twelve lines)                   |
| `pointerGesture`, `cssLength`                    | Internal to the components that use them            |
| `pathMatch` (`/app`)                             | Internal: `requestMatch` and `Router` match with it |
| `serviceDefinition`, `SERVICE_COMMANDS` (`/app`) | `service(command, options)` and `vbc-service`       |
| `HOT_RELOAD_PATH` (`/app`)                       | Internal to `hotReload` and `reloadOnBuild`         |

Apps: void-driller 40 (`chance` and `weightedChance` through its `utils/index.js`, which re-exports `@vanilla-bean/components/utils`: server/Game.js 34, client/Play/GameObjects/Ground.js 4, server/generateAsteroid.js 2): copy the two functions into its own utils. No app imports the others.

<!-- Further 7.0 renames go above this section, grouped by component as above. -->

## Also changed since 6.3.0

Not renames, but an app may look or behave differently:

- **Focus and selection are yellow.** One focus ring, in the `selected` role, marks keyboard focus everywhere, and selected, checked and pressed fill in the same role; they were blue.
- **Status colors are roles**: `success`, `info`, `warning`, `danger`, each settable on `theme.colors`, as are `surface`, `raised`, `accent`, `edge`, `overlay`, `muted` and `border`.
- **Overlays share one surface**: Dialog, Popover, ContextMenu, Notify and BottomSheet use the `surface` color, an accent `edge` and elevation shadows. Dialog's corners are 6px (were square) and its backdrop is lighter (60%, was 85%). Toasts are the surface tinted by their intent.
- **Safe areas**: Dialog, Notify, BottomSheet and the `bar` Toolbar keep clear of a phone's notch and home indicator. A toast stack sits above `--vbc-notify-offset` (set it to an app's bottom bar height), and spans a phone's width.
- **Headings and type are relative**: h1, h2, h3 and h4 to h6 are 1.5em, 1.25em, 1.125em and 1em (were 24px, 20px, 17px and 15px), from a `fontSize` scale (`xs` to `xxl`) that components use too. Motion takes `duration` tokens and stills for `prefers-reduced-motion`.
- **Secondary text is `muted`, hairlines are `border`.** A field's error is written below it in `danger`.
- **Links can be drawn as buttons**: `variant: 'flat'` or `'chip'` on a Link, as on a Button.
- **hypertether is re-exported**: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `resource`, `failureReason` and `resetRequest` come from `@vanilla-bean/components`; hypertether is `^1.2.0`.
- **`crudResource`** in `utils` is the client half of the app kit's `crudRoutes`: hypertether's `resource` whose update returns a stale write's `conflict` (the fields that differ and the stored record) rather than a bare failure.
- **Keyboard event options work**: `onKeyDown` and `onKeyUp` given as options were wired to the DOM's `keydown` and `keyup`, so they never heard a key; now they hear the Keyboard's `keyDown` and `keyUp`.
- **Focus events are recognised**: `onFocus`, `onFocusin` and `onFocusout` options are listeners, and `on()` warns in development of an event name it can't hear.
