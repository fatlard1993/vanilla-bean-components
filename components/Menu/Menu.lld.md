# Menu

> ./Menu.js

Styled list whose items trigger an `onSelect` callback. The design decision: Menu routes selection through the same unified pointer+keyboard activation path as Button — keyboard and pointer users get the same experience without separate handlers.

## Selecting a menu item works the same way regardless of input method

- clicking, touching, Space/Enter, and screen reader activation all invoke `onSelect` — one handler, no separate keyboard path
  - does clicking a menu item invoke onSelect?

## Menu renders any item format that List supports

- strings, objects with labels, and component instances all work as menu items
  - does a Menu with mixed string and object items render without error?
