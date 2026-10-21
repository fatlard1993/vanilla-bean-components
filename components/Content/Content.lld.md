# Content

> ./Content.js

The scrolling part of a view. It scrolls itself rather than the page, so a toolbar above it stays in reach.

## Padding is an option, in pixels when a number

- a number is pixels and a string is used as written
  - new Subject({ padding: 12, appendTo: document.body }) captures a then new Subject({ padding: "0 1em", appendTo: document.body }) captures b -> a.elem.style.padding === "12px" && b.elem.style.padding === "0px 1em"

## A column keeps reading width on a wide screen

- a column is centered at 960px unless given a width of its own
  - new Subject({ column: true, appendTo: document.body }) captures c then c.elem.classList.contains("column") captures centered then c.options.column = 640 -> centered === true && c.elem.style.getPropertyValue("--content-column") === "640px"
- padding left unset sets nothing inline, so a subclass's own CSS padding applies
  - new Subject({ appendTo: document.body }) captures c -> c.elem.style.padding === ""

## The column holds whatever is in it

**browser:** true

- a child with margins of its own still fills the column and sits centered in it
  - new Array() captures probe then document.body.appendChild(Object.assign(document.createElement("div"), { style: "width: 600px; display: flex; flex-direction: column" })) captures wrap then new Subject({ column: 200, appendTo: wrap }, Object.assign(document.createElement("div"), { style: "margin: 4px 0", textContent: "a line" })) captures c then await new Promise(r => setTimeout(r, 700)) then c.elem.firstElementChild.getBoundingClientRect() captures child then wrap.getBoundingClientRect() captures outer -> Math.round(child.width) === 200 && Math.round(child.left - outer.left) === 200
