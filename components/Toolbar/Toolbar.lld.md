# Toolbar

> ./Toolbar.js

A row of controls that wraps rather than overflowing, since a toolbar that runs off a phone's screen hides its last controls.

## It wraps unless told not to

- the gap and wrapping follow their options
  - new Subject({ appendTo: document.body }) captures t then t.elem.style.flexWrap captures wrapped then t.options.wrap = false then t.options.gap = 4 -> wrapped === "wrap" && t.elem.style.flexWrap === "nowrap" && t.elem.style.gap === "4px"

## A heading makes it a page's header

A page's top bar is a title and the page's tools. The title takes the room the tools leave, so a long one truncates rather than pushing them off; a back button marked `start` sits before it.

- the heading comes first and follows its option, and clearing it takes it away
  - new Subject({ heading: "Fields", appendTo: document.body }, document.createElement("button")) captures t then t.elem.firstElementChild.textContent captures first then t.options.heading = "Leases" then t.elem.firstElementChild.textContent captures renamed then t.options.heading = null -> first === "Fields" && renamed === "Leases" && t.elem.querySelector(".heading") === null
- the bar variant marks the toolbar for its look
  - new Subject({ variant: "bar", appendTo: document.body }) captures t -> t.elem.classList.contains("variant-bar")
- emptying a header's controls keeps its heading, and a truncated heading still shows whole on hover
  - new Subject({ heading: "A long field name", appendTo: document.body }, document.createElement("button")) captures t then t.empty() -> t.elem.children.length === 1 && t.elem.firstElementChild.title === "A long field name"
