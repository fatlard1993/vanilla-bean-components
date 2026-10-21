# Card

> ./Card.js

A raised patch holding one thing. The decision is that the accent and the hover answer are options rather than subclasses, so an app's list of records gets the same card whatever it puts in it.

## The accent is a stripe on the left edge

- an accent marks the card and names its color; clearing it takes the stripe away
  - new Subject({ accent: "red", appendTo: document.body }) captures card then card.elem.style.getPropertyValue("--card-accent") captures during then card.options.accent = null -> during === "red" && card.elem.classList.contains("accented") === false

## A card that does something answers the pointer

- a card given onPointerPress is interactive, and one without is not
  - new Subject({ onPointerPress: () => {}, appendTo: document.body }) captures card -> card.elem.classList.contains("interactive")
  - new Subject({ appendTo: document.body }) captures card -> card.elem.classList.contains("interactive") === false
- a card that does something is reached and pressed by keyboard like a button
  - new Array() captures pressed then new Subject({ onPointerPress: () => pressed.push(1), appendTo: document.body }) captures card then card.elem.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })) -> pressed.length === 1 && card.elem.tabIndex === 0 && card.elem.getAttribute("role") === "button"
