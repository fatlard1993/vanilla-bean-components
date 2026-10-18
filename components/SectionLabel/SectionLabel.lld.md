# SectionLabel

> ./SectionLabel.js

A heading in what it says to screen readers, a quiet label in how it looks: it doesn't use a heading element, so the theme's heading styles never reach it.

## It is a heading without a heading element

- it carries the heading role at the level asked for
  - new Subject({ textContent: "Recent", level: 4, appendTo: document.body }) captures s -> s.elem.getAttribute("role") === "heading" && s.elem.getAttribute("aria-level") === "4" && /^H\d$/.test(s.elem.tagName) === false
