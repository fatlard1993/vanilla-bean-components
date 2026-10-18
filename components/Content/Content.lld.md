# Content

> ./Content.js

The scrolling part of a view. It scrolls itself rather than the page, so a toolbar above it stays in reach.

## Padding is an option, in pixels when a number

- a number is pixels and a string is used as written
  - new Subject({ padding: 12, appendTo: document.body }) captures a then new Subject({ padding: "0 1em", appendTo: document.body }) captures b -> a.elem.style.padding === "12px" && b.elem.style.padding === "0px 1em"
