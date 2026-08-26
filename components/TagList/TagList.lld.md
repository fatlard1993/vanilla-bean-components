# TagList

> ./TagList.js

Editable tag collection. The key decision: read-only mode removes the editing interface entirely rather than disabling it; a read-only TagList is structurally simpler, not just interaction-blocked.

## Read-only mode produces a different structure, not just disabled controls

- `readOnly: true` omits the input and add button entirely; `readOnly: false` includes the full editing interface
  - does a readOnly TagList contain no input element?
  - new Subject({ readOnly: false, tags: [] }) captures t -> !!t.elem.querySelector("input") && !!t.elem.querySelector("button")

## Duplicate tags are silently rejected - adding them does nothing

- attempting to add a tag that already exists leaves the list unchanged; there is no error
  - new Subject({ tags: ["hello"], autoRender: false }) captures t then t.render() then t.elem.children.length captures before then t.tagInput.elem.value = "hello" then t.tagInput.elem.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true })) -> t.elem.children.length === before

## The add interface stays at the end as tags are added and removed

- new tags are inserted before the add-tag input; the input remains the last element automatically
  - new Subject({ tags: [], autoRender: false }) captures u then u.render() then u.tagInput.elem.value = "new-tag" then u.tagInput.elem.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true })) -> u.elem.lastElementChild === u.addTag.elem

## Cleanup removes the editing interface completely on destroy

- the input, button, and popover are destroyed with the component, removing event listeners
  - does destroying the TagList remove its editing interface from the DOM?

## Enter commits a tag; nothing else does, and nothing empty or repeated gets in

Typing is not committing -- the field has to stay usable while a tag is being spelled, so only Enter turns what is typed into a tag. What arrives is then filtered on the two grounds that are always wrong: nothing at all, and something already in the list.

- Enter adds the typed tag; any other key leaves the list as it was
  - new Subject({ tags: ["one"], appendTo: document.body }) captures t then t.tagInput.elem.value = "two" then t.tagInput.elem.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true })) then Array.from(t.elem.querySelectorAll("li[data-value]")).map(li => li.dataset.value) captures afterEnter then t.tagInput.elem.value = "three" then t.tagInput.elem.dispatchEvent(new KeyboardEvent("keyup", { key: "a", bubbles: true })) -> afterEnter.join() === "one,two" && Array.from(t.elem.querySelectorAll("li[data-value]")).map(li => li.dataset.value).join() === "one,two"
- a blank or whitespace-only entry is not added, and neither is one already present
  - new Subject({ tags: ["one"], appendTo: document.body }) captures t then t.tagInput.elem.value = "   " then t.tagInput.elem.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true })) then Array.from(t.elem.querySelectorAll("li[data-value]")).length captures afterBlank then t.tagInput.elem.value = "one" then t.tagInput.elem.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true })) -> afterBlank === 1 && t.elem.querySelectorAll("li[data-value]").length === 1
