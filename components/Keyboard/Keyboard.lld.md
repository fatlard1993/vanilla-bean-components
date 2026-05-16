# Keyboard

> ./Keyboard.js

On-screen keyboard where layout switching rebuilds the key DOM rather than showing/hiding rows. The decision: a clean rebuild on layout change is safer than managing per-key visibility across layout transitions — no key from one layout can bleed into another.

## Layout switch produces only keys from the new layout — no residual keys remain

- changing `layout` removes all existing keys and builds the new set from scratch; a key that exists in layout A but not layout B is definitively absent after the switch
  - does switching layout remove keys from the previous layout?
  - does the new layout's keys appear after switching?

## Key events carry the key definition alongside the key name

- `keyDown`, `keyUp`, and `keyPress` emit with both the key name and its configuration object, so handlers can respond to semantic meaning rather than just the character pressed
  - does a key press event include the definition object for that key?

## Regex-named keys match families of keys to one definition

- a key definition whose name is a regex pattern matches all physical keys that satisfy it; modifier handling and key families are expressed as patterns, not enumerated one by one
  - does a key matching a regex definition trigger that definition's behavior?
