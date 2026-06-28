# ColorPicker

> ./ColorPicker.js

HSL-based color picker where hue and saturation/lightness are controlled by separate areas. The key design decision is that `value: 'random'` is a valid state; the picker starts in a selection mode rather than requiring a starting color.

## Multiple input formats are accepted without the caller normalizing first

- color strings, color objects, and the sentinel 'random' all produce a valid picker state without error
  - does initializing with a color string produce a valid picker state?
  - does initializing with value 'random' produce a valid picker state?

## Dragging outside the picker area does not produce out-of-range colors

- the position is clamped to the picker's bounds regardless of where the pointer goes; callers receive valid color values even during aggressive drag behavior
  - does dragging well outside the saturation area still produce a valid color value?

## Hue and saturation areas have independent pointer tracking

- interaction with the hue bar does not affect the saturation/lightness position and vice versa
  - does adjusting the hue leave the saturation value unchanged?
