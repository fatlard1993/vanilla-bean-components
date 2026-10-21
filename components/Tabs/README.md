# Tabs

[[extract-description Tabs.js]]

## Usage

```js
[[import ./demo.js]]/^(\t*).+component = new.+\(\s*{(.|\n)+?\1}?\);/gm
```

## Options

[[extract-options Tabs.js]]

## Methods

[[extract-methods Tabs.js]]

## Properties

[[extract-properties Tabs.js]]

## Events

[[extract-events Tabs.js]]

## Dependencies

[[extract-imports Tabs.js]]

## Design

![design](../Tabs/design.excalidraw.png)

## Segmented

`variant: 'segmented'` draws the same tabs as a pill split into its choices: for switching between a few views of the same thing (by day / by project, list / chart). It keeps the tabs' keyboard behaviour and roles.

A tab can carry an `icon` (a Font Awesome name) beside its label: `{ id: 'chart', label: 'Chart', icon: 'chart-line' }`.
