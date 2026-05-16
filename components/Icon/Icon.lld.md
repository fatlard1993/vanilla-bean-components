# Icon

> ./Icon.js

FontAwesome icon wrapper that manages FA class state as options rather than raw class strings. The design decision: callers pass `icon: "star"` and the component owns the full FA class lifecycle — callers never manually add or remove FA classes.

## Changing icon leaves no residual classes from the previous value

- when the icon option changes, all previous FA icon classes are removed before the new one is applied; a caller can freely update the icon option without accumulating stale classes
  - does an element that had icon 'star' and was updated to 'moon' have only the moon icon?

## Icon-only and icon-with-text render differently without the caller specifying which mode

- when there is no text content, the element receives the `icon` class, which CSS uses for icon-only layout; when text accompanies the icon, that class is absent
  - does an Icon constructed without text receive the icon-only class?
  - does an Icon constructed with text not receive the icon-only class?

## Animation and icon are independent options that compose

- setting `animation` applies an animation class independently of `icon`; an Icon with both options active carries both classes simultaneously — they do not interfere
  - does an Icon with both icon and animation options active carry both classes at the same time?
