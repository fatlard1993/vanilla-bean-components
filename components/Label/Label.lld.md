# Label

> ./Label.js

Labeling wrapper with five structural variants. The key decision is that `variant` selects a DOM structure, not just a CSS class — each variant builds a different composition of elements suited to its use case.

## Each variant applies a distinct class that drives its CSS behavior

- 'collapsible', 'overlay', 'inline', 'inline-after', and 'simple' each apply their own class to the component element; swapping `variant` changes the class and the structural CSS rules that attach to it
  - does the 'collapsible' variant produce a clickable element that shows and hides content?

## Collapsed state is externally controllable, not just toggle-driven

- `collapsed: true` sets the initial collapsed state; assigning to it later expands or collapses programmatically without simulating user interaction
  - does setting collapsed: true hide the wrapped content?
  - does setting collapsed: false after construction show the previously hidden content?

## Overlay label visibility is driven by CSS pseudo-class, not JavaScript

- the overlay variant's label visibility responds to whether the input has content via the `:placeholder-shown` pseudo-class; the component adds the structural class and the CSS handles the rest
