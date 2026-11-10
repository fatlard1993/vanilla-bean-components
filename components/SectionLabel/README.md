# SectionLabel

A small, quiet heading over a group of things: muted, uppercase and letter-spaced. It is announced as a heading (`role="heading"` at `level`, 3 by default) without taking a heading element's page-wide look: the theme sizes and weights every `h1`–`h6` for a page or document title, which is too loud for a label over a group. First in its container it drops its top margin, as an `h1` does, so a group that opens with one needs no override.

```js
new SectionLabel({ textContent: 'Recent' });
new SectionLabel({ textContent: 'Archived', level: 4 });
```
