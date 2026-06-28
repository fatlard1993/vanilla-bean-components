# Notify

> ./Notify.js

Transient notification that self-destructs. The design choice is that click-to-dismiss is always on; every notification is interactive, not a passive message. The `type` option drives icon and color selection so callers communicate intent rather than manually picking icons.

## Type communicates intent; the component selects the appropriate icon

- callers pass `type: 'error'` and the component picks the matching icon; a custom `icon` option overrides this only when the standard mapping doesn't fit
  - does a success notification use a visually distinct icon from an error notification?

## Clicking anywhere on the notification dismisses it — the whole surface is the target

- notifications are temporary and should be easy to clear; there is no separate close button
  - does clicking the notification body remove it from the page?

## Manual dismiss cancels a pending timeout — no duplicate destroy fires

- when a `timeout` is set and the user dismisses manually before it fires, the timer is cancelled so a second destroy call after the component is already gone cannot happen
  - does manually dismissing a notification before its timeout prevent a second dismiss?
