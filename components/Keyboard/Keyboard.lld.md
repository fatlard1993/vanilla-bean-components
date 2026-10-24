# Keyboard

> ./Keyboard.js

On-screen keyboard where layout switching rebuilds the key DOM rather than showing/hiding rows. The decision: a clean rebuild on layout change is safer than managing per-key visibility across layout transitions; no key from one layout can bleed into another.

## Layout switch produces only keys from the new layout - no residual keys remain

- changing `layout` removes all existing keys and builds the new set from scratch; a key that exists in layout A but not layout B is definitively absent after the switch
  - new Subject({ layout: "simple", appendTo: document.body }) captures k then Array.from(k.elem.querySelectorAll("button")).map(b => b.textContent) captures before then k.options.layout = "number" then Array.from(k.elem.querySelectorAll("button")).map(b => b.textContent) captures after -> before.includes("q") && after.includes("q") === false
  - new Subject({ layout: "simple", appendTo: document.body }) captures k then Array.from(k.elem.querySelectorAll("button")).map(b => b.textContent) captures before then k.options.layout = "number" then Array.from(k.elem.querySelectorAll("button")).map(b => b.textContent) captures after -> before.includes("1") === false && after.includes("1")

## Key events carry the key definition alongside the key name

- `keyDown`, `keyUp`, and `keyPress` emit with both the key name and its configuration object, so handlers can respond to semantic meaning rather than just the character pressed
  - new Array() captures seen then new Subject({ layout: "simple", appendTo: document.body, onKeyPress: e => seen.push(e.detail) }) captures k then Array.from(k.elem.querySelectorAll("button")).find(b => b.textContent === "ABC") captures key then key.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })) then key.dispatchEvent(new PointerEvent("pointerup", { bubbles: true })) then key.click() -> seen.length === 1 && seen[0].key === "simple" && seen[0].keyDefinition.text === "ABC"

## A key is named by its layout entry, not by what it sends

A definition's `key` is what a press sends; the layout entry is the key's name. Styling and labels hang off the name, so two entries that send the same key stay distinct buttons, and a definition that only changes what is sent keeps its own label and class.

- a definition's `key` does not rename the button: its class and fallback label come from the layout entry
  - new Subject({ layout: "media", keyDefinitions: { volUp: { key: "audio_vol_up", text: "" }, "!": { mod: "shift", key: "1" } }, layouts: { media: [["volUp", "!"]] }, appendTo: document.body }) captures k then Array.from(k.elem.querySelectorAll("button")) captures keys -> keys[0].classList.contains("volUp") && !keys[0].classList.contains("audio_vol_up") && keys[1].textContent === "!"
- a press on a renamed key still emits the definition's `key`, so the handler receives what the definition sends
  - new Array() captures seen then new Subject({ layout: "media", keyDefinitions: { volUp: { key: "audio_vol_up", text: "" } }, layouts: { media: [["volUp"]] }, appendTo: document.body, onKeyPress: e => seen.push(e.detail) }) captures k then k.elem.querySelector("button.volUp") captures key then key.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })) then key.dispatchEvent(new PointerEvent("pointerup", { bubbles: true })) then key.click() -> seen.length === 1 && seen[0].key === "audio_vol_up"

## Regex-named keys match families of keys to one definition

- a key definition whose name is a regex pattern matches all physical keys that satisfy it; modifier handling and key families are expressed as patterns, not enumerated one by one
  - new Subject({ layout: "number", keyDefinitions: { "^[0-9]$": { class: "digit" } }, appendTo: document.body }) captures k then Array.from(k.elem.querySelectorAll("button")) captures keys then keys.filter(b => b.className.includes("digit")).map(b => b.textContent) captures digits -> digits.length === 10 && digits.includes("0") && digits.includes("9") && !keys.some(b => b.textContent === "backspace" && b.className.includes("digit"))

A name only counts as a pattern when it is anchored at both ends. Without that rule an ordinary name is a substring match against every key, so a definition called `a` would silently claim every key containing an `a`.

- an unanchored name matches one key by name; only a name anchored at both ends is treated as a pattern
  - new Subject({ layout: "number", keyDefinitions: { ".": { class: "dot" } }, appendTo: document.body }) captures k then Array.from(k.elem.querySelectorAll("button")) captures keys then keys.filter(b => b.className.includes("dot")) captures dotted -> keys.length > 5 && dotted.length === 1 && dotted[0].textContent === "."

## Key events are ordinary events

A subscription that cannot be undone is a leak, so key events are declared events rather than a subscription API of the keyboard's own: `onKeyDown` as an option, `on()`, or `addEventListener` with a signal, each ending the way any listener does.

- `on()` hears a key event, and the keyboard has no subscription methods of its own
  - new Array() captures seen then new Subject({ layout: "simple", appendTo: document.body }) captures k then k.on({ targetEvent: "keyPress", callback: e => seen.push(e.detail.key) }) then Array.from(k.elem.querySelectorAll("button")).find(b => b.textContent === "q") captures key then key.click() -> seen.join() === "q" && k.onKeyPress === undefined
