# List

> ./List.js

Flexible list that meets items where they are. The core design decision: items can be strings, DOM nodes, component instances, or configuration objects; the component figures out what to do with each format. Callers don't normalize data before passing it.

## Items render correctly regardless of their input format

- a single `items` array can contain mixed formats without error
  - does a List render a mix of string and object items without failing?

## Per-item component overrides compose cleanly with the global default

- the component set globally on the list applies to all items; a per-item `ListItemComponent` overrides for that item only
  - does a per-item ListItemComponent render that item differently from the default?

## noStyle opts out of default list chrome for embedding contexts

- `noStyle: true` removes bullets, padding, and line-height defaults via a CSS class so the embedding layout can control spacing
