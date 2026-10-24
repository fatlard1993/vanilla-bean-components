# Input

> ./Input.js

Input element that infers its type from the value it receives rather than requiring callers to declare it. The deeper design decision is that `isDirty` makes unsaved-change detection a first-class property; forms don't need to track initial values themselves.

## Type is communicated by the value, not by a separate option

- callers pass a value; the input determines its type from that value's type
  - new Subject({ value: 7 }) captures i -> i.elem.type === "number"
  - new Subject({ value: true }) captures i -> i.elem.type === "checkbox"

## isDirty reflects whether the value has changed from its initial state

- the initial value is recorded at construction; `isDirty` answers "has the user changed this?" without external tracking
  - does isDirty return false when the value matches the initial value?
  - new Subject({ value: "start" }) captures i then i.isDirty captures before then i.options.value = "changed" -> before === false && i.isDirty === true

## Validation errors are surfaced as element state, not return values

A validator is `value => message`, what's wrong in words or nothing: the shape a Form field, a TagList and a server store field take too, so one function checks a field everywhere. The message is shown, not hidden behind a button, and is read out with the field.

- when a validation fails, the element enters an error state that CSS can target; passing clears it
  - new Subject({ value: "", validate: v => (v ? null : "required"), appendTo: document.body }) captures i then i.validate() -> i.elem.classList.contains("validation-errors")
  - new Subject({ value: "", validate: v => (v ? null : "required"), appendTo: document.body }) captures i then i.validate() then i.options.value = "filled" then i.validate() -> i.elem.classList.contains("validation-errors") === false

- what's wrong is written below the field and read out with it; a list of validators shows each message
  - new Subject({ value: "", validate: [v => (v ? null : "required"), v => v.length < 3 && "too short"], appendTo: document.body }) captures i then i.validate() then document.getElementById(i.elem.getAttribute("aria-describedby")) captures message -> message.textContent === "required\ntoo short" && i.elem.nextElementSibling === message
- a value that passes takes the message away
  - new Subject({ value: "", validate: v => (v ? null : "required"), appendTo: document.body }) captures i then i.validate() then i.elem.nextElementSibling captures message then i.validate({ value: "x" }) -> message.isConnected === false && i.elem.getAttribute("aria-describedby") === null

## Textarea height follows content automatically

**browser:** true

- when `tag: 'textarea'`, the element resizes to fit its content without the caller managing height
  - new Subject({ tag: "textarea", appendTo: document.body, value: "one line" }) captures i then i.elem.offsetHeight captures before then i.elem.value = "a\nb\nc\nd\ne\nf\ng\nh" then i.elem.dispatchEvent(new Event("input", { bubbles: true })) then await new Promise(r => setTimeout(r, 60)) -> i.elem.offsetHeight > before

## Sizing and checkbox state read from the same `value`/`height` options

`height` is a number when the caller is thinking in rows and a string when they are thinking in CSS, so the number is interpreted as text rows and anything else is passed to the style as written. A checkbox has no useful text value either, so for that type `value` drives the checked state instead.

- a numeric `height` is interpreted as rows of text; a string is used as the CSS length verbatim
  - new Subject({ tag: "textarea", height: 3, appendTo: document.body }) captures rows then new Subject({ tag: "textarea", height: "40px", appendTo: document.body }) captures css -> rows.elem.style.height === "4em" && css.elem.style.height === "40px"
- for `type: 'checkbox'` the value sets the checked state rather than the element's text value
  - new Subject({ type: "checkbox", value: true, appendTo: document.body }) captures on then new Subject({ type: "checkbox", value: false, appendTo: document.body }) captures off -> on.elem.checked === true && off.elem.checked === false
- an input with no `validate` option is valid: `validate()` finds nothing wrong and marks nothing
  - new Subject({ value: "", appendTo: document.body }) captures i then i.validate() captures errors -> errors === undefined && i.elem.getAttribute("aria-invalid") === null

## Syntax highlighting is opt-in, and the element's defaults follow its tag

A `language` on its own says what the content is, not that it should be coloured -- highlighting is a separate decision because it costs a stylesheet and changes how the field reads. The text-input defaults are likewise scoped to the tags they make sense for: a `select` is an Input but not a text field.

- `language` alone adds no highlighting class; `syntaxHighlighting` is what turns it on
  - new Subject({ language: "js", appendTo: document.body }) captures off then new Subject({ language: "js", syntaxHighlighting: true, appendTo: document.body }) captures on -> off.elem.className.includes("language-js") === false && on.elem.classList.contains("language-js")
- text-input defaults apply to `input` and `textarea` and not to other tags an Input can take
  - new Subject({ appendTo: document.body }) captures text then new Subject({ tag: "select", appendTo: document.body }) captures select -> text.elem.getAttribute("autocomplete") === "off" && select.elem.getAttribute("autocomplete") === null
- `validate()` returns the messages it produced and marks the element invalid; a value that passes returns nothing and clears the mark
  - new Subject({ validate: v => (v === "ok" ? null : "must be ok"), value: "no", appendTo: document.body }) captures bad then bad.validate() captures errors then new Subject({ validate: v => (v === "ok" ? null : "must be ok"), value: "ok", appendTo: document.body }) captures good then good.validate() captures none -> errors.join() === "must be ok" && bad.elem.getAttribute("aria-invalid") === "true" && none === undefined && good.elem.getAttribute("aria-invalid") === null

## A file field hands over files however they came, already filtered

Picking, dropping and pasting are three routes to one question (which files did the user give?), so a file Input answers it once, through `onFiles`, with what `accept` allows. Apps were writing the drop handling four times over.

- a drop zone passes on only the dropped files accept allows, and marks itself while files are dragged over it
  - new Array() captures got then document.createElement("div") captures zone then document.body.append(zone) then new Subject({ type: "file", accept: ".csv", dropZone: zone, onFiles: files => got.push(...files.map(f => f.name)), appendTo: document.body }) then zone.dispatchEvent(Object.assign(new Event("dragover", { cancelable: true }), { dataTransfer: { types: ["Files"], files: [] } })) then zone.classList.contains("drag-over") captures marked then zone.dispatchEvent(Object.assign(new Event("drop", { cancelable: true }), { dataTransfer: { types: ["Files"], files: [new File(["x"], "a.csv"), new File(["x"], "b.png")] } })) -> marked === true && zone.classList.contains("drag-over") === false && got.join() === "a.csv"
