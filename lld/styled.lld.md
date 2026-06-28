# styled

> lld/helpers/styled.js

Higher-order function that attaches scoped CSS to a component class. The scope is one of several layers in a flexible range of CSS strategies: from global theme tokens to per-definition class scopes to per-instance inline styles. `styled()` occupies the per-definition layer: one scope class, shared by all instances of the same styled component.

## Each call to styled() creates an independent scope

**method:** `idFromTwo`

- calling `styled(Button)` twice produces two independently-scoped component classes; the same base class can have many styled variants
  - idFromTwo() captures result → result[0] !== result[1]

## All instances of one styled component share one scope class

**method:** `instancesPairSameClass`

- the scope class is created when `styled()` is called and shared by all instances; this is the appropriate layer for shared visual definition
  - instancesPairSameClass() → true

## The scope is invisible to callers

**method:** `styledIsConstructable`

- callers construct and use the styled component exactly as they would the unstyled base class; no special caller configuration is required
  - styledIsConstructable() → true

## Function syntax and template literal syntax are equivalent

- both syntaxes attach a scope class; the choice is stylistic, not functional

**method:** `functionSyntaxHasScope`

- function syntax: `styled(Button, css)` attaches a scope class
  - functionSyntaxHasScope() → true

**method:** `templateSyntaxHasScope`

- template literal syntax: ``styled(Button)`...css...` `` attaches a scope class
  - templateSyntaxHasScope() → true

## Theme values are available inside the CSS

**method:** `themeInterpolation`

- template literal interpolations that are functions are called with the active theme object at inject time; this is how design tokens reach the component's styles without coupling CSS strings to specific values
  - themeInterpolation() → true

## configured() applies option defaults without adding styles

**method:** `configuredClass`

- `configured()` is a lighter version of `styled()` for when only option defaults are needed and no CSS is being added; a `configured()` component can be further wrapped with `styled()`
  - does configured() produce a component that behaves like the base class?
