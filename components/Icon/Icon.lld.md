# Icon

> ./Icon.js

FontAwesome icon wrapper that manages FA class state as options rather than raw class strings. The design decision: callers pass `icon: "star"` and the component owns the full FA class lifecycle; callers never manually add or remove FA classes.

## Changing icon leaves no residual classes from the previous value

- when the icon option changes, all previous FA icon classes are removed before the new one is applied; a caller can freely update the icon option without accumulating stale classes
  - does an element that had icon 'star' and was updated to 'moon' have only the moon icon?

## Icon-only and icon-with-text render differently without the caller specifying which mode

- when there is no text content, the element receives the `icon` class, which CSS uses for icon-only layout; when text accompanies the icon, that class is absent
  - new Subject({ icon: "star" }) captures i -> i.elem.classList.contains("icon") === true
  - new Subject({ icon: "star", textContent: "hi" }) captures i -> i.elem.classList.contains("icon") === false

## Animation and icon are independent options that compose

- setting `animation` applies an animation class independently of `icon`; an Icon with both options active carries both classes simultaneously; they do not interfere
  - new Subject({ icon: "star", animation: "spin" }) captures i -> i.elem.classList.contains("fa-star") && i.elem.classList.contains("fa-spin")

## Animating the glyph is a separate choice from animating the element

A FontAwesome animation class animates whatever element carries it. On a bare Icon that reads correctly, because the element and the glyph are the same box. On a subclass that also renders a label (Button, Link) it takes the whole control with it, background and text included, which is rarely what a caller asking for a spinner meant. `animation` keeps that element-level behavior; `iconAnimation` runs the same set of animations against the `:before` that draws the glyph. The two are independent, so a caller can run either or both.

- setting `iconAnimation` never applies the element-level FA animation class, and setting `animation` never applies the glyph one
  - new Subject({ icon: "spinner", iconAnimation: "spin" }) captures i -> i.elem.classList.contains("icon-animation-spin") && !i.elem.classList.contains("fa-spin")
  - new Subject({ icon: "spinner", animation: "beat", iconAnimation: "spin" }) captures i -> i.elem.classList.contains("fa-beat") && i.elem.classList.contains("icon-animation-spin")

- an icon animation decorates the glyph and says nothing about layout; it never makes the element icon-only
  - new Subject({ icon: "spinner", iconAnimation: "spin", textContent: "Saving" }) captures i -> i.elem.classList.contains("icon") === false

## A decorative icon is hidden from assistive technology; a meaningful one is not

An icon with nothing but a glyph carries no information a screen reader can convey, and announcing its class name is worse than silence. An icon that has text beside it, carries its own label, or is itself the control is content, and must stay announceable.

- an icon with no text, no label and no interactive role is marked `aria-hidden`; text, a label, or an interactive tag each keep it announced
  - new Subject({ icon: "star", appendTo: document.body }) captures bare then new Subject({ icon: "star", textContent: "Save", appendTo: document.body }) captures withText then new Subject({ icon: "star", "aria-label": "Save", appendTo: document.body }) captures labelled then new Subject({ icon: "star", tag: "button", appendTo: document.body }) captures control -> bare.elem.getAttribute("aria-hidden") === "true" && withText.elem.getAttribute("aria-hidden") === null && labelled.elem.getAttribute("aria-hidden") === null && control.elem.getAttribute("aria-hidden") === null
