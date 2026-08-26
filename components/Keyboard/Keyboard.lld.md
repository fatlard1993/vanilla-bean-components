# Keyboard

> ./Keyboard.js

On-screen keyboard where layout switching rebuilds the key DOM rather than showing/hiding rows. The decision: a clean rebuild on layout change is safer than managing per-key visibility across layout transitions; no key from one layout can bleed into another.

## Layout switch produces only keys from the new layout - no residual keys remain

- changing `layout` removes all existing keys and builds the new set from scratch; a key that exists in layout A but not layout B is definitively absent after the switch
  - new Subject({ layout: "simple", appendTo: document.body }) captures k then Array.from(k.elem.querySelectorAll("button")).map(b => b.textContent) captures before then k.options.layout = "number" then Array.from(k.elem.querySelectorAll("button")).map(b => b.textContent) captures after -> before.includes("q") && after.includes("q") === false
  - new Subject({ layout: "simple", appendTo: document.body }) captures k then Array.from(k.elem.querySelectorAll("button")).map(b => b.textContent) captures before then k.options.layout = "number" then Array.from(k.elem.querySelectorAll("button")).map(b => b.textContent) captures after -> before.includes("1") === false && after.includes("1")

## Key events carry the key definition alongside the key name

- `keyDown`, `keyUp`, and `keyPress` emit with both the key name and its configuration object, so handlers can respond to semantic meaning rather than just the character pressed
  - new Array() captures seen then new Subject({ layout: "simple", appendTo: document.body, onKeyPress: e => seen.push(e.detail) }) captures k then Array.from(k.elem.querySelectorAll("button")).find(b => b.textContent === "ABC") captures key then key.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })) then key.dispatchEvent(new PointerEvent("pointerup", { bubbles: true })) -> seen.length === 1 && seen[0].key === "simple" && seen[0].keyDefinition.text === "ABC"

## Regex-named keys match families of keys to one definition

- a key definition whose name is a regex pattern matches all physical keys that satisfy it; modifier handling and key families are expressed as patterns, not enumerated one by one
  - new Subject({ layout: "number", keyDefinitions: { "^[0-9]$": { class: "digit" } }, appendTo: document.body }) captures k then Array.from(k.elem.querySelectorAll("button")) captures keys then keys.filter(b => b.className.includes("digit")).map(b => b.textContent) captures digits -> digits.length === 10 && digits.includes("0") && digits.includes("9") && !keys.some(b => b.textContent === "backspace" && b.className.includes("digit"))

A name only counts as a pattern when it is anchored at both ends. Without that rule an ordinary name is a substring match against every key, so a definition called `a` would silently claim every key containing an `a`.

- an unanchored name matches one key by name; only a name anchored at both ends is treated as a pattern
  - new Subject({ layout: "number", keyDefinitions: { ".": { class: "dot" } }, appendTo: document.body }) captures k then Array.from(k.elem.querySelectorAll("button")) captures keys then keys.filter(b => b.className.includes("dot")) captures dotted -> keys.length > 5 && dotted.length === 1 && dotted[0].textContent === "."

## Subscribing to a key event returns the means to stop

Callers wire key handlers into components that come and go, so a subscription that cannot be undone is a leak. The subscribe helpers hand back an unsubscribe rather than requiring the caller to keep the original function around to pass to a removal call.

- `onKeyDown`, `onKeyUp` and `onKeyPress` return a function that ends the subscription; after calling it, further presses are not delivered
  - new Array() captures seen then new Subject({ layout: "simple", appendTo: document.body }) captures k then k.onKeyDown(() => seen.push("down")) captures offDown then k.onKeyUp(() => seen.push("up")) captures offUp then k.onKeyPress(() => seen.push("press")) captures offPress then Array.from(k.elem.querySelectorAll("button")).find(b => b.textContent === "q") captures key then key.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })) then key.dispatchEvent(new PointerEvent("pointerup", { bubbles: true })) then seen.slice() captures whileSubscribed then offDown() then offUp() then offPress() then key.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })) then key.dispatchEvent(new PointerEvent("pointerup", { bubbles: true })) -> whileSubscribed.length === 3 && seen.length === 3
