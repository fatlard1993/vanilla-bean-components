# TagList

> ./TagList.js

Editable tag collection. Two decisions carry it. Read-only mode removes the editing interface entirely rather than disabling it; a read-only TagList is structurally simpler, not just interaction-blocked. And the tags are its `value`, held in options rather than read back from the DOM, so a TagList is a field like any other: it announces `change` with the new list and sits in a Form.

## Read-only mode produces a different structure, not just disabled controls

- `readOnly: true` omits the input and add button entirely; `readOnly: false` includes the full editing interface
  - does a readOnly TagList contain no input element?
  - new Subject({ readOnly: false, value: [] }) captures t -> !!t.elem.querySelector("input") && !!t.elem.querySelector("button")

## Duplicate tags are silently rejected - adding them does nothing

- attempting to add a tag that already exists leaves the list unchanged; there is no error
  - new Subject({ value: ["hello"], autoRender: false }) captures t then t.render() then t.elem.children.length captures before then t.tagInput.elem.value = "hello" then t.tagInput.elem.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true })) -> t.elem.children.length === before

## The add interface stays at the end as tags are added and removed

- new tags are inserted before the add-tag input; the input remains the last element automatically
  - new Subject({ value: [], autoRender: false }) captures u then u.render() then u.tagInput.elem.value = "new-tag" then u.tagInput.elem.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true })) -> u.elem.lastElementChild === u.addTag.elem

## Cleanup removes the editing interface completely on destroy

- the input, button, and popover are destroyed with the component, removing event listeners
  - does destroying the TagList remove its editing interface from the DOM?

## Enter commits a tag; nothing else does, and nothing empty or repeated gets in

Typing is not committing -- the field has to stay usable while a tag is being spelled, so only Enter turns what is typed into a tag. What arrives is then filtered on the two grounds that are always wrong: nothing at all, and something already in the list.

- Enter adds the typed tag; any other key leaves the list as it was
  - new Subject({ value: ["one"], appendTo: document.body }) captures t then t.tagInput.elem.value = "two" then t.tagInput.elem.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true })) then Array.from(t.elem.querySelectorAll("li[data-value]")).map(li => li.dataset.value) captures afterEnter then t.tagInput.elem.value = "three" then t.tagInput.elem.dispatchEvent(new KeyboardEvent("keyup", { key: "a", bubbles: true })) -> afterEnter.join() === "one,two" && Array.from(t.elem.querySelectorAll("li[data-value]")).map(li => li.dataset.value).join() === "one,two"
- a blank or whitespace-only entry is not added, and neither is one already present
  - new Subject({ value: ["one"], appendTo: document.body }) captures t then t.tagInput.elem.value = "   " then t.tagInput.elem.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true })) then Array.from(t.elem.querySelectorAll("li[data-value]")).length captures afterBlank then t.tagInput.elem.value = "one" then t.tagInput.elem.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true })) -> afterBlank === 1 && t.elem.querySelectorAll("li[data-value]").length === 1

## What counts as a tag can be the caller's to say

A tag list over a fixed vocabulary (the games a collection holds, the people on a team) refuses anything else and stores what it does accept in the vocabulary's own spelling. A refused entry stays in the field, said so as any field's error is, ready to be corrected.

- accept returns the tag to add, or false to refuse it
  - new Subject({ accept: v => (v.toLowerCase() === "chess" ? "Chess" : false), appendTo: document.body }) captures t then t._addTag("chess") then t._addTag("monopoly") -> t.options.value.join() === "Chess" && t.tagInput.elem.getAttribute("aria-invalid") === "true"


## The tags are the value, and a change is announced with them

The list used to live only in the DOM, and `tags` went stale the moment a tag was added: an app read the tags back by querying `li[data-value]`. Now the value is the list, every add and remove changes it, and `change` carries it as `event.value`, as every component's change does.

- adding and removing a tag change `value` and announce `change` with the new list
  - new Array() captures heard then new Subject({ value: ["one"], onChange: e => heard.push(e.value.join("+")), appendTo: document.body }) captures t then t.tagInput.elem.value = "two" then t.tagInput.elem.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true })) then t.elem.querySelector("li[data-value] button").click() -> heard.join() === "one+two,two" && t.options.value.join() === "two"
- a value set from outside redraws the tags without announcing a change
  - new Array() captures heard then new Subject({ value: ["a"], onChange: () => heard.push(1), appendTo: document.body }) captures t then t.options.value = ["b", "c"] -> heard.length === 0 && Array.from(t.elem.querySelectorAll("li[data-value]")).map(li => li.dataset.value).join() === "b,c"
- the word being typed is not a change of the list
  - new Array() captures heard then new Subject({ onChange: () => heard.push(1), appendTo: document.body }) captures t then t.tagInput.elem.value = "half" then t.tagInput.elem.dispatchEvent(new Event("change", { bubbles: true })) -> heard.length === 0

## A Form holds it like any other field

A Form gives a component with its own `validate()` the field's validators, so a TagList checks itself as an Input does, with the same `value => message` and the same message below it. (components/TagList/.test.js runs it inside a Form.)

- its `validate` checks the list and shows what's wrong below it, marking the new-tag field invalid
  - new Array() captures probe then document.createElement("div") captures host then document.body.append(host) then new Subject({ value: [], validate: tags => (tags.length ? null : "Add a tag"), appendTo: host }) captures t then t.validate() captures errors -> errors.join() === "Add a tag" && t.tagInput.elem.getAttribute("aria-invalid") === "true" && host.textContent.includes("Add a tag")
