# SectionLabel

> ./SectionLabel.js

A heading in what it says to screen readers, a quiet label in how it looks: it doesn't use a heading element, so the theme's heading styles never reach it.

## It is a heading without a heading element

- it carries the heading role at the level asked for
  - new Subject({ textContent: "Recent", level: 4, appendTo: document.body }) captures s -> s.elem.getAttribute("role") === "heading" && s.elem.getAttribute("aria-level") === "4" && /^H\d$/.test(s.elem.tagName) === false

## In a row, the row spaces it

A label in a header row shares the line with a total or a button, and its own margin would push the row taller and off
its baseline. `inRow` drops it, so an app needn't override the margin (structure.sectionlabel-margin).

- inRow marks the label for its row's spacing, and unmarks it again
  - new Subject({ textContent: "Net worth", inRow: true, appendTo: document.body }) captures s then s.elem.classList.contains("in-row") captures marked then (s.options.inRow = false) -> marked === true && s.elem.classList.contains("in-row") === false
