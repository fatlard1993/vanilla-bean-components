# ColorPicker

> ./ColorPicker.js

HSL-based color picker where hue and saturation/lightness are controlled by separate areas. The key design decision is that `value: 'random'` is a valid state; the picker starts in a selection mode rather than requiring a starting color.

## Multiple input formats are accepted without the caller normalizing first

- color strings, color objects, and the sentinel 'random' all produce a valid picker state without error
  - new Subject({ value: "#3366cc" }) captures p -> CSS.supports("color", String(p.options.value)) && p.hue >= 0
  - new Subject({ value: "random" }) captures p -> CSS.supports("color", String(p.options.value)) && String(p.options.value) !== "random"

## Dragging outside the picker area does not produce out-of-range colors

**browser:** true

- the position is clamped to the picker's bounds regardless of where the pointer goes; callers receive valid color values even during aggressive drag behavior
  - new Subject({ appendTo: document.body, value: "#3366cc" }) captures p then await new Promise(r => setTimeout(r, 80)) then p.pickerArea.elem captures area then area.getBoundingClientRect() captures box then area.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: box.left + 5, clientY: box.top + 5 })) then document.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 1, clientX: box.right + 4000, clientY: box.bottom + 4000 })) then await new Promise(r => setTimeout(r, 140)) then p.pickerIndicator.elem.getBoundingClientRect() captures ind -> ind.top - box.top >= box.height - 10 && CSS.supports("color", String(p.options.value))

## Hue and saturation areas have independent pointer tracking

**browser:** true

- interaction with the hue bar does not affect the saturation/lightness position and vice versa
  - new Subject({ appendTo: document.body, value: "#3366cc" }) captures p then await new Promise(r => setTimeout(r, 100)) then p.pickerIndicator.elem.getBoundingClientRect() captures svBefore then p.hue captures hueBefore then p.hueArea.elem.getBoundingClientRect() captures hb then p.hueArea.elem.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: hb.left + 20, clientY: hb.top + 15 })) then document.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 1, clientX: hb.left + hb.width * 0.4, clientY: hb.top + 15 })) then await new Promise(r => setTimeout(r, 100)) then document.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 1, clientX: hb.left + hb.width * 0.7, clientY: hb.top + 15 })) then await new Promise(r => setTimeout(r, 100)) then document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1, clientX: hb.left + hb.width * 0.7, clientY: hb.top + 15 })) then await new Promise(r => setTimeout(r, 100)) then p.pickerIndicator.elem.getBoundingClientRect() captures svAfter -> Math.round(p.hue) !== Math.round(hueBefore) && Math.abs(svAfter.left - svBefore.left) < 1 && Math.abs(svAfter.top - svBefore.top) < 1
  - new Subject({ appendTo: document.body, value: "#3366cc" }) captures p then await new Promise(r => setTimeout(r, 100)) then p.pickerIndicator.elem.getBoundingClientRect() captures svBefore then p.hue captures hueBefore then p.pickerArea.elem.getBoundingClientRect() captures pb then p.pickerArea.elem.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: pb.left + 10, clientY: pb.top + 10 })) then document.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 1, clientX: pb.left + pb.width * 0.7, clientY: pb.top + pb.height * 0.7 })) then await new Promise(r => setTimeout(r, 100)) then document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1, clientX: pb.left + pb.width * 0.7, clientY: pb.top + pb.height * 0.7 })) then await new Promise(r => setTimeout(r, 100)) then p.pickerIndicator.elem.getBoundingClientRect() captures svAfter -> Math.round(p.hue) === Math.round(hueBefore) && Math.abs(svAfter.top - svBefore.top) > 1

## Hue is remembered when the colour alone cannot carry it

A colour string does not always determine a slider position. Fully desaturated colours have no hue to read back, and the conversion wraps 360 to 0 -- the same red, but the opposite end of the slider. In both cases the picker keeps the hue it already had, so the handle stays where the user put it. An empty value is not a colour at all and changes nothing.

- a colour that reports hue 0 while the slider sits near 360 keeps its position rather than jumping to the other end
  - new Subject({ value: "hsl(355, 80%, 50%)", appendTo: document.body }) captures p then Math.round(p.hue) captures before then p.options.value = "hsl(0, 80%, 50%)" -> before === 355 && Math.round(p.hue) === 355
- assigning an empty value leaves the picker's state as it was
  - new Subject({ value: "#3366cc", appendTo: document.body }) captures p then Math.round(p.hue) captures hueBefore then p.elem.style.backgroundColor captures bgBefore then p.options.value = "" -> hueBefore === 220 && Math.round(p.hue) === 220 && p.elem.style.backgroundColor === bgBefore

## The `random` swatch shows that it is a choice, not a colour

Every other swatch can paint itself with the colour it selects. `random` has no colour to show, so painting it any single colour would misrepresent what pressing it does -- it carries the rainbow treatment instead.

- a `random` entry renders as the rainbow swatch while ordinary entries paint their own colour
  - new Subject({ swatches: ["#ff0000", "random"], appendTo: document.body }) captures p then Array.from(p.elem.querySelectorAll("*")) captures parts -> parts.filter(e => e.className.includes("rainbow")).length === 1 && parts.some(e => e.style.backgroundColor !== "" && !e.className.includes("rainbow"))
- the `random` swatch is left unpainted so the rainbow treatment shows through; a colour swatch paints itself with its own colour
  - new Subject({ swatches: ["#ff0000", "random"], appendTo: document.body }) captures p then Array.from(p.elem.querySelectorAll("*")) captures parts then parts.filter(e => e.className.includes("rainbow")) captures rainbow -> rainbow.length === 1 && rainbow[0].style.backgroundColor === "" && parts.some(e => !e.className.includes("rainbow") && (e.style.backgroundColor === "#ff0000" || e.style.backgroundColor === "rgb(255, 0, 0)"))
