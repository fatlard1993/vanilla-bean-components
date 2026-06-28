# BottomSheet

> ./BottomSheet.js

Bottom sheet overlay that slides up from the bottom. Mounts to `document.body` by default. Drag down to dismiss; `hide()` closes it from code.

## show() / hide() control visibility

- calling `show()` slides the sheet into view; calling `hide()` slides it out
- `onClose` fires when the sheet is dismissed (either by drag or by `hide()`)
  - does calling hide() invoke the onClose callback?
  - does the sheet animate out before calling onClose?

## Drag below the threshold dismisses the sheet

- a drag handle at the top of the sheet captures pointer events; dragging past a distance threshold triggers `hide()`
- the sheet should not dismiss on small accidental drags
  - does dragging the handle downward past the threshold dismiss the sheet?
  - does a short drag that doesn't reach the threshold leave the sheet visible?

## Navigating away (hashchange) closes the sheet

- the sheet registers a one-time `hashchange` listener on `show()` and removes it on `hide()`
- the sheet doesn't outlive navigation
  - does navigating to a new hash while the sheet is open dismiss it?
