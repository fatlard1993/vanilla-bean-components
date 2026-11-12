# FormDialog

> ./FormDialog.js

A Dialog that holds a Form and ends in Save, Delete or Cancel. The design decision is that the dialog owns the flow every record dialog repeated by hand (validate, hand over the data, close, or stay open when that failed) while the caller owns only what saving and deleting mean.

## Saving is validated, handed over, and then closes

- an invalid form does not reach onSave, and the dialog stays
  - new Array() captures calls then new Subject({ inputs: [{ key: "name", validate: value => (value ? null : "Required") }], data: { name: "" }, onSave: () => calls.push(1), appendTo: document.body }) captures d then await d.save() captures saved -> saved === false && calls.length === 0 && d.elem.isConnected === true
- a valid form hands its data to onSave, and the dialog closes
  - new Array() captures calls then new Subject({ inputs: [{ key: "name" }], data: { name: "Garden" }, onSave: data => calls.push(data.name), appendTo: document.body }) captures d then await new Promise(r => setTimeout(r, 40)) then await d.save() captures saved then await new Promise(r => setTimeout(r, 30)) -> saved === true && calls[0] === "Garden" && d.elem.isConnected === false
- onSave returning false keeps the dialog open, so what was typed is not lost
  - new Subject({ inputs: [{ key: "name" }], data: { name: "Garden" }, onSave: () => false, appendTo: document.body }) captures d then await d.save() captures saved -> saved === false && d.elem.isConnected === true
- a request that comes back failed keeps it open too, since a request library reports failure rather than throwing it
  - new Subject({ inputs: [{ key: "name" }], data: { name: "Garden" }, onSave: () => ({ status: "error", response: { ok: false } }), appendTo: document.body }) captures d then await d.save() captures saved -> saved === false && d.elem.isConnected === true
- a failed save says why in the dialog, so the person can fix it there; the next try clears it
  - new Array("Name taken") captures reasons then new Subject({ inputs: [{ key: "name" }], data: { name: "Garden" }, onSave: () => ({ status: "error", body: { error: reasons.shift() ?? "" }, response: { ok: false, status: 409 } }), appendTo: document.body }) captures d then await d.save() then d.elem.querySelector(".failure").textContent captures shown then await d.save() -> shown === "Name taken" && d.elem.querySelector(".failure").textContent === "HTTP 409"
- the reason sits just above the buttons, below anything else the dialog holds
  - new Subject({ inputs: [{ key: "name" }], data: { name: "Garden" }, onSave: () => ({ status: "error", body: { error: "Name taken" }, response: { ok: false, status: 409 } }), appendTo: document.body }) captures d then d.body.elem.append("extra") then await d.save() -> d.elem.querySelector(".failure").nextElementSibling === d.elem.querySelector(".footer") && d.elem.querySelector(".failure").previousElementSibling.textContent.endsWith("extra")
- a returned message is the reason, shown in the dialog without being reported as an error
  - new Array() captures reported then new Array(globalThis.reportError) captures kept then Object.assign(globalThis, { reportError: e => reported.push(e) }) then new Subject({ inputs: [{ key: "name" }], data: { name: "Garden" }, onSave: () => "Name taken", appendTo: document.body }) captures d then await d.save() captures saved then Object.assign(globalThis, { reportError: kept[0] }) -> saved === false && d.elem.isConnected === true && d.elem.querySelector(".failure").textContent === "Name taken" && reported.length === 0
- a button of the dialog's own saves through save(action), taking the same checks and failure line in place of onSave
  - new Array() captures calls then new Subject({ inputs: [{ key: "name" }], data: { name: "Garden" }, onSave: () => calls.push("save"), appendTo: document.body }) captures d then await d.save(data => (calls.push(data.name), "Not yet")) captures saved -> saved === false && calls.join() === "Garden" && d.elem.querySelector(".failure").textContent === "Not yet"
- a thrown error shows its message
  - new Array(globalThis.reportError) captures kept then Object.assign(globalThis, { reportError: () => {} }) then new Subject({ inputs: [{ key: "name" }], data: { name: "Garden" }, onSave: () => Promise.reject(new Error("offline")), appendTo: document.body }) captures d then await d.save() then Object.assign(globalThis, { reportError: kept[0] }) -> d.elem.querySelector(".failure").textContent === "offline"

## Delete appears only when there is something to delete

- without onDelete the buttons are Cancel then Save; with it, Delete comes first, set apart at the far end from Save
  - new Subject({ inputs: [{ key: "name" }], appendTo: document.body }) captures plain then new Subject({ inputs: [{ key: "name" }], onDelete: () => {}, appendTo: document.body }) captures deletable -> Array.from(plain.elem.querySelectorAll(".footer button")).map(b => b.textContent).join() === "Cancel,Save" && Array.from(deletable.elem.querySelectorAll(".footer button")).map(b => b.textContent).join() === "Delete,Cancel,Save"

## A button is known by what it does, not what it says

FormDialog used to recognise Save, Delete and Cancel by comparing labels, so an app that listed its own buttons got their meaning only while the words matched, and a button of its own that happened to be called "Save" was taken over. Its buttons now carry a `data-action`.

- a button marked `data-action: save` saves whatever its label; a label alone means nothing to FormDialog
  - new Array() captures saved then new Subject({ inputs: [{ key: "name" }], data: { name: "a" }, buttons: [{ textContent: "Keep", "data-action": "save" }, "Save"], onSave: () => saved.push("save"), onButtonPress: ({ button }) => saved.push("own:" + button), appendTo: document.body }) captures d then Array.from(d.elem.querySelectorAll(".footer button")) captures buttons then buttons[1].click() then buttons[0].click() then await new Promise(r => setTimeout(r, 20)) -> saved.join() === "own:Save,save"
- the delete confirmation is in the `danger` intent
  - new Subject({ inputs: [{ key: "name" }], onDelete: () => {}, confirmDelete: "Really?", appendTo: document.body }) captures d then d.delete() then await new Promise(r => setTimeout(r, 20)) -> Array.from(document.querySelectorAll("dialog")).at(-1).classList.contains("intent-danger")

## Enter saves from a single-line field, and only from one

- Enter in a text input saves; in a textarea it is a newline
  - new Array() captures saves then new Subject({ inputs: [{ key: "name" }, { key: "notes", tag: "textarea" }], data: { name: "n", notes: "" }, onSave: () => saves.push(1), appendTo: document.body }) captures d then d.form.elem.querySelector("textarea").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })) then saves.length captures fromTextarea then d.form.elem.querySelector("input").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })) then await new Promise(r => setTimeout(r, 20)) -> fromTextarea === 0 && saves.length === 1

## Cancel never deletes

- with onDelete given, pressing Cancel closes without deleting
  - new Array() captures deletes then new Subject({ inputs: [{ key: "name" }], onDelete: () => deletes.push(1), appendTo: document.body }) captures d then Array.from(d.elem.querySelectorAll(".footer button")).find(b => b.textContent === "Cancel").click() then await new Promise(r => setTimeout(r, 20)) -> deletes.length === 0

## A delete that asks first does nothing when the answer is no

- declining the confirmation resolves false and calls no onDelete
  - new Array() captures deletes then new Subject({ inputs: [{ key: "name" }], onDelete: () => deletes.push(1), confirmDelete: "Really?", appendTo: document.body }) captures d then d.delete() captures pending then await new Promise(r => setTimeout(r, 40)) then Array.from(document.querySelectorAll("dialog")).at(-1)._component.close() then await pending captures answer -> answer === false && deletes.length === 0
- with no confirmation asked, delete() runs onDelete
  - new Array() captures deletes then new Subject({ inputs: [{ key: "name" }], onDelete: () => deletes.push(1), appendTo: document.body }) captures d then await d.delete() captures settled -> deletes.length === 1 && settled !== null
