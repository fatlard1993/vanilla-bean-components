# SectionLabel

A small, quiet heading over a group of things: muted, uppercase and letter-spaced. It is announced as a heading (`role="heading"` at `level`, 3 by default) without taking a heading element's page-wide look, which in the theme's element styles carries markdown prefixes.

```js
new SectionLabel({ textContent: 'Recent' });
new SectionLabel({ textContent: 'Archived', level: 4 });
```
