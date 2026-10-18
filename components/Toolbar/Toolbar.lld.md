# Toolbar

> ./Toolbar.js

A row of controls that wraps rather than overflowing, since a toolbar that runs off a phone's screen hides its last controls.

## It wraps unless told not to

- the gap and wrapping follow their options
  - new Subject({ appendTo: document.body }) captures t then t.elem.style.flexWrap captures wrapped then t.options.wrap = false then t.options.gap = 4 -> wrapped === "wrap" && t.elem.style.flexWrap === "nowrap" && t.elem.style.gap === "4px"
