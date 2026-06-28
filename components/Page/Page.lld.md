# Page

> ./Page.js

Top-level layout component that takes ownership of stylesheet loading. The design decision: Page loads FontAwesome and typography as part of mounting; application code does not import or configure these separately.

## Required stylesheets load once — remounting does not re-fetch

- Page checks whether each stylesheet is already present before injecting; remounting in a single-page app does not duplicate link elements or re-trigger network requests
  - does mounting a Page a second time leave the stylesheet count unchanged?

## External stylesheets fetch and inject as style content, not link elements

- `styleSheets` URLs are fetched at mount time and their content is injected as `<style>` elements, avoiding cross-origin link restrictions
  - does a stylesheet URL's content appear in the document as an inline style element?

## Page sets a full-height flex baseline at construction

- height: 100% and flex display are applied as inline styles at construction
  - does a Page element have height: 100% applied at construction?
