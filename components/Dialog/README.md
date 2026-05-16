# Dialog

Modal and non-modal dialog component built on the native `<dialog>` element with animated open/close, configurable sizes, color variants, and flexible button configurations.

## Usage

```js
import { Dialog } from 'vanilla-bean-components';

const dialog = new Dialog({
	header: 'Confirm Action',
	body: 'Are you sure you want to proceed?',
	buttons: ['Cancel', { text: 'Confirm', variant: 'success' }],
	onButtonPress: ({ button, closeDialog }) => {
		console.log('pressed', button);
		closeDialog();
	},
});
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `header` | `string` | — | Text rendered in the `<h2>` header |
| `body` | `string\|Component\|Array` | — | Content for the scrollable body section. Reactive — updating `options.body` replaces content |
| `buttons` | `Array<string\|object>` | — | Shorthand footer buttons. Each entry is a string label or `{ textContent, variant?, onPointerPress?, ...buttonOptions }` |
| `footer` | `Array<Component>` | — | Fully custom footer components. Takes precedence over `buttons` |
| `onButtonPress` | `Function` | — | Called when any `buttons` entry is pressed. Receives `{ button, closeDialog, event }` |
| `openOnRender` | `number\|boolean` | `16` | Auto-open delay in ms after render. Set to `false` to disable auto-open |
| `modal` | `boolean` | `true` | Open as a modal (with backdrop) vs. non-modal |
| `size` | `string` | `'small'` | Dialog dimensions — `'small'` (420×210px), `'standard'` (840×420px), `'large'` (90vw×90vh) |
| `variant` | `string` | — | Color theme — `'info'`, `'success'`, `'warning'`, `'error'` |
| `closeDialog` | `Function` | — | Override the default close behavior used inside `onButtonPress` |
| `appendTo` | `Element` | `document.body` | Where to append the dialog in the DOM |
| `augmentedUI` | `string` | `'tl-clip tr-2-clip-x br-clip bl-2-clip-y border'` | Augmented-UI clip configuration |

### `onButtonPress` callback signature

```js
onButtonPress: ({ button, closeDialog, event }) => { ... }
// button      — the original entry from the buttons array (string or object)
// closeDialog — function that closes the dialog (calls dialog.close() by default)
// event       — the pointer event that triggered the press
```

## Methods

```js
dialog.open(modal?: boolean): void
// Opens the dialog. Defaults to options.modal. Falls back to re-render on first failure.

dialog.close(returnValue?: string): void
// Closes the dialog. Passes returnValue to the native dialog close event.
```

Enums are exposed as instance properties for validation reference:

```js
dialog.size_enum; // ['small', 'standard', 'large']
dialog.variant_enum; // ['info', 'success', 'warning', 'error']
```

## Events

| Event   | Description                                         |
| ------- | --------------------------------------------------- |
| `close` | Native dialog close event, registered automatically |

## Example

Dialog with reactive body content loaded asynchronously:

```js
import { Dialog } from 'vanilla-bean-components';
import { Button } from 'vanilla-bean-components';

const dialog = new Dialog({
	header: 'Results',
	size: 'standard',
	variant: 'info',
	body: 'Loading...',
	buttons: ['Dismiss'],
	openOnRender: false,
	onButtonPress: ({ closeDialog }) => closeDialog(),
});

fetchResults().then(data => {
	dialog.options.body = data.summary;
});

new Button({
	textContent: 'View Results',
	onPointerPress: () => dialog.open(),
	appendTo: document.body,
});
```
