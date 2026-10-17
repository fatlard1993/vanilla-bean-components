# FormDialog

> ./FormDialog.js

A Dialog that holds a Form and ends in Save, Delete or Cancel. The design decision is that the dialog owns the flow every record dialog repeated by hand (validate, hand over the data, close, or stay open when that failed) while the caller owns only what saving and deleting mean.

## Saving is validated, handed over, and then closes

- an invalid form does not reach onSave, and the dialog stays
  - new Array() captures calls then new Subject({ inputs: [{ key: "name", validations: [[/.+/, "Required"]] }], data: { name: "" }, onSave: () => calls.push(1), appendTo: document.body }) captures d then await d.save() captures saved -> saved === false && calls.length === 0 && d.elem.isConnected === true
- a valid form hands its data to onSave, and the dialog closes
  - new Array() captures calls then new Subject({ inputs: [{ key: "name" }], data: { name: "Garden" }, onSave: data => calls.push(data.name), appendTo: document.body }) captures d then await new Promise(r => setTimeout(r, 40)) then await d.save() captures saved then await new Promise(r => setTimeout(r, 30)) -> saved === true && calls[0] === "Garden" && d.elem.isConnected === false
- onSave returning false keeps the dialog open, so what was typed is not lost
  - new Subject({ inputs: [{ key: "name" }], data: { name: "Garden" }, onSave: () => false, appendTo: document.body }) captures d then await d.save() captures saved -> saved === false && d.elem.isConnected === true

## Delete appears only when there is something to delete

- without onDelete the buttons are Save and Cancel; with it, Delete sits between them
  - new Subject({ inputs: [{ key: "name" }], appendTo: document.body }) captures plain then new Subject({ inputs: [{ key: "name" }], onDelete: () => {}, appendTo: document.body }) captures deletable -> Array.from(plain.elem.querySelectorAll(".footer button")).map(b => b.textContent).join() === "Save,Cancel" && Array.from(deletable.elem.querySelectorAll(".footer button")).map(b => b.textContent).join() === "Save,Delete,Cancel"
