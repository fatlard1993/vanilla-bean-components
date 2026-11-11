# Code

Code, a command or a path shown on a page. Pass the text as `code` and Code picks the element: one line is an inline `<code>`, text with a newline is a `<pre><code>` block. Reach for it rather than a styled `<code>` or `<pre>` of your own, and for its `copyButton` rather than a Copy button built beside one.

## Usage rules

The [usage rules](../../docs/USAGE_RULES.md) that bear on Code: [structure.code-for-code](../../docs/USAGE_RULES.md#structure-and-display).

## Usage

```js
import { Code } from '@vanilla-bean/components';

new Code({ code: 'bun add @vanilla-bean/components' });
new Code({ code: 'bun install\nbun run build', language: 'shell', copyButton: true });
```

## Copying

`copyButton: true` adds an icon button that copies `code`. A copy that works says so in a short toast by the block; one the browser refuses (no clipboard outside a secure context, or permission denied) says so too, and to select the text and copy it instead, so the reader doesn't find out on paste.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `code` | `string` | - | The text shown; reactive |
| `language` | `string` | `'javascript'` | Adds a `language-<name>` class, the hook highlighting libraries look for. Code highlights nothing itself |
| `multiline` | `boolean\|'auto'` | `'auto'` | Block or inline; `'auto'` is a block when `code` has a newline. Decided once, at construction |
| `copyButton` | `boolean` | `false` | A button that copies `code` to the clipboard |
