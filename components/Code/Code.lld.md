# Code

> ./Code.js

Code display that automatically promotes from inline to block when the content spans multiple lines. The decision: callers pass code and the component determines the appropriate element — callers never choose between `code` and `pre>code` themselves.

## Multiline content renders as a block element without the caller specifying it

- the component detects newlines at render time and promotes accordingly
  - does code with newlines render as a block (pre) rather than an inline element?
  - does single-line code render inline?

## Language class enables syntax highlighting libraries to identify the element

- the `language` option adds a `language-{name}` class; highlighting libraries target this class by convention
  - does the language option add an identifiable class to the code element?

## Copy confirms success visually — clipboard writes can fail silently

- the copy button shows a notification on success so the user knows the copy worked rather than discovering it failed on paste
  - does a successful copy show the user a confirmation?
