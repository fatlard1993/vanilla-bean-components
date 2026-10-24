# Store

> ./store.js

A collection of records in a JSON file, for an app whose data fits in memory. The file is the whole database: no server to run, nothing to migrate, and it travels with the user. Three decisions carry the weight. Every record comes in through one door that knows its fields, so nothing of the wrong shape is stored to crash some reader later. An id names only a record the collection owns, never something every object inherits. And memory never runs ahead of the file: a change that fails to write is undone.

## Only known fields are stored, checked against their types

- a field the store doesn't know is dropped, and one left out lands as its type's empty value
  - new Array() captures start then Subject.createStore({ db: { data: {}, write: async () => {} }, fields: { name: { type: "string" }, tags: { type: "stringArray" } } }) captures store then await store.create({ name: "Chess", extra: 1 }) captures game -> game.extra === undefined && Array.isArray(game.tags) && game.tags.length === 0
- a field's `validate`, the same `value => message` a Form field takes, refuses a value with its message, naming the field
  - new Array() captures start then Subject.createStore({ db: { data: {}, write: async () => {} }, fields: { name: { type: "string", validate: v => (v.trim() ? null : "Give it a name") } } }) captures store then await store.create({ name: "  " }).catch(error => error.message) captures refusal then await store.create({ name: "Chess" }) captures made -> refusal === "name: Give it a name" && made.name === "Chess"
- a required field missing is refused, naming it, rather than stored as a hole
  - new Array() captures start then Subject.createStore({ db: { data: {}, write: async () => {} }, fields: { name: { type: "string", required: true } } }) captures store then await store.create({}).catch(error => error.message) captures refusal -> refusal === "name is required"
- a value of the wrong shape is refused, naming the field
  - new Array() captures start then Subject.createStore({ db: { data: {}, write: async () => {} }, fields: { tags: { type: "stringArray" } } }) captures store then await store.create({ tags: "not a list" }).catch(error => error.message) captures refusal -> refusal === "tags: expected a list"

## An id names only a record the collection owns

- an inherited or reserved key is not a record, however a request spells it // `data.toString` exists on every plain object, and `__proto__` reaches the prototype
  - new Array() captures start then Subject.createStore({ db: { data: {}, write: async () => {} }, fields: ["name"] }) captures store then store.has("toString") captures inherited -> inherited === false
  - new Array() captures start then Subject.createStore({ db: { data: {}, write: async () => {} }, fields: ["name"] }) captures store then await store.update({ id: "__proto__", update: { name: "x" } }) captures result -> result === false

## Memory never runs ahead of the file

- a create whose write fails leaves no record behind, so what the app shows matches what a restart would load
  - new Array() captures start then Subject.createStore({ db: { data: {}, write: async () => { throw new Error("disk full") } }, fields: ["name"] }) captures store then await store.create({ name: "Go" }).catch(() => null) captures result then store.list() captures left -> result === null && left.length === 0

## A versioned store refuses an update made against an older version

- two people editing one record don't silently overwrite each other; the later save learns what changed instead
  - new Array() captures start then Subject.createStore({ db: { data: {}, write: async () => {} }, fields: ["name"], versioned: true }) captures store then await store.create({ name: "Chess" }) captures game then await store.update({ id: game.id, update: { name: "Go", _v: 1 } }) then await store.update({ id: game.id, update: { name: "Checkers", _v: 1 } }).catch(error => error) captures stale -> stale.current.name === "Go"
