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
- a thrown error shows its message
  - new Array(globalThis.reportError) captures kept then Object.assign(globalThis, { reportError: () => {} }) then new Subject({ inputs: [{ key: "name" }], data: { name: "Garden" }, onSave: () => Promise.reject(new Error("offline")), appendTo: document.body }) captures d then await d.save() then Object.assign(globalThis, { reportError: kept[0] }) -> d.elem.querySelector(".failure").textContent === "offline"

## Delete appears only when there is something to delete

- without onDelete the buttons are Save and Cancel; with it, Delete sits between them
  - new Subject({ inputs: [{ key: "name" }], appendTo: document.body }) captures plain then new Subject({ inputs: [{ key: "name" }], onDelete: () => {}, appendTo: document.body }) captures deletable -> Array.from(plain.elem.querySelectorAll(".footer button")).map(b => b.textContent).join() === "Save,Cancel" && Array.from(deletable.elem.querySelectorAll(".footer button")).map(b => b.textContent).join() === "Save,Delete,Cancel"
