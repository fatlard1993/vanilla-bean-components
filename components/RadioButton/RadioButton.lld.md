# RadioButton

> ./RadioButton.js

Radio group from an array of options. The design decision: the HTML `name` coordination that makes radios mutually exclusive is handled automatically; callers pass values and get a working group without managing name attributes.

## All radios in the group share one name — mutual exclusivity is provided by the browser

- the component generates a shared `name` attribute; the browser enforces that only one radio in the group can be checked at a time
  - does each radio input in the group share the same name attribute?

## Options can separate their stored value from their display label

- a string option uses its value as both the label and stored datum; an object with `label` and `value` lets them differ, useful when the stored value (an ID, a code) would be confusing as a visible label
  - does an object option with a separate label display the label rather than the raw value?
