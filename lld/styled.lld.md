# styled

> styled/styled.js
**companion:** `../Component/Component.js`

Higher-order function that attaches scoped CSS to a component class. The scope is one of several layers in a flexible range of CSS strategies: from global theme tokens to per-definition class scopes to per-instance inline styles. `styled()` occupies the per-definition layer: one scope class, shared by all instances of the same styled component.

## Each call to styled() creates an independent scope

- calling `styled(Button)` twice produces two independently-scoped component classes; the same base class can have many styled variants
  - do two separate calls to styled() with the same base class produce different scope classes?

## All instances of one styled component share one scope class

- the scope class is created when `styled()` is called and shared by all instances; this is the appropriate layer for shared visual definition
  - do two instances of the same styled component share the same scope class?

## The scope is invisible to callers

- callers construct and use the styled component exactly as they would the unstyled base class; no special caller configuration is required
  - does an instance of a styled component behave as an instance of the base class?

## Function syntax and template literal syntax are equivalent

- both syntaxes attach a scope class; the choice is stylistic, not functional
- function syntax: `styled(Button, css)` attaches a scope class
  - does function syntax attach a scope class?
- template literal syntax: ``styled(Button)`...css...` `` attaches a scope class
  - does template literal syntax attach a scope class?

## Theme values are available inside the CSS

- template literal interpolations that are functions are called with the active theme object at inject time; this is how design tokens reach the component's styles without coupling CSS strings to specific values
  - does a function interpolated into a styled() template literal receive the theme object?
  - new Array() captures probe then (class { constructor(o = {}) { this.elem = document.createElement("div"); this.options = o; } addClass(...groups) { for (const g of groups.flat()) if (g) this.elem.classList.add(g); } }) captures Base then Subject.styled(Base) captures tag then tag`zzpad: ${"1379px"}; margin: ${2468}px; color: ${({ colors }) => colors.white};` captures Styled then Array.from(document.querySelectorAll("style")).map(s => s.textContent).join("") captures css -> css.includes("zzpad: 1379px") && css.includes("2468px") && css.includes("=>") === false && css.includes("undefinedzzpad") === false
- the same substitution runs when `styled` is called directly with the strings and values as arguments
  - new Array() captures probe then (class { constructor(o = {}) { this.elem = document.createElement("div"); this.options = o; } addClass(...groups) { for (const g of groups.flat()) if (g) this.elem.classList.add(g); } }) captures Base then Object.assign(["zzarg: ", "; margin: ", "px; color: ", ";"], { raw: ["zzarg: ", "; margin: ", "px; color: ", ";"] }) captures strings then Subject.styled(Base, strings, "1379px", 2468, ({ colors }) => colors.white) captures Styled then Array.from(document.querySelectorAll("style")).map(s => s.textContent).join("") captures css -> css.includes("zzarg: 1379px") && css.includes("2468px") && css.includes("=>") === false && css.includes("undefinedzzarg") === false

## configured() applies option defaults without adding styles

- `configured()` is a lighter version of `styled()` for when only option defaults are needed and no CSS is being added; a `configured()` component can be further wrapped with `styled()`
  - does configured() produce a component that behaves like the base class?
