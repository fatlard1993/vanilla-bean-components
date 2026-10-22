# ColorSwatch

> ./ColorSwatch.js

A button that shows a color and is pressed to choose it. The design decision is that `random` is a color it can be given: it has no single color to show, so it cycles through the hues rather than pretending to be one.

## A color fills it; random cycles

- a color fills the swatch and nothing cycles
  - new Subject({ color: "#ff0000", appendTo: document.body }) captures s -> s.elem.style.backgroundColor !== "" && s.elem.classList.contains("rainbow") === false
- random is left unfilled so the cycling shows, until it is given a color
  - new Subject({ color: "random", appendTo: document.body }) captures s then s.elem.classList.contains("rainbow") captures cycled then s.options.color = "#00ff00" -> cycled === true && s.elem.classList.contains("rainbow") === false && s.elem.style.backgroundColor !== ""
