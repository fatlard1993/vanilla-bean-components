# Table

> ./Table.js

Sortable data table where sort state is explicit options. The design decision: `sortProperty` and `sortDirection` are readable and writable options — the sort state is in the component's options object, not hidden inside event handlers, so it's readable and settable from outside.

## Sort state lives in options — externally readable and settable

- clicking a column header updates `sortProperty` and `sortDirection` as regular options; external code can read or set sort state without querying the DOM
  - does clicking a sortable column update sortProperty to that column's key?
  - does clicking an already-sorted column toggle sortDirection?

## Custom cell renderers receive the full row context, not just the cell value

- a column's `dataColumn` function receives `{ column, rowData, table }` so cells can cross-reference other columns or interact with the table
  - does a dataColumn function receive the complete rowData object for its row?

## Footer aligns with data columns, not with DOM order

- footer cells are positioned by column key; adding or reordering columns does not misalign footer labels from data
  - does the footer appear in the correct columns regardless of column order?
