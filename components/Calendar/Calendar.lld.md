# Calendar

> ./Calendar.js

Multi-view calendar that renders the same event data differently depending on scale. The key design decision: `view` is an option like any other — changing it triggers a full re-render with the same events laid out for the new context. No view-specific state accumulates.

## Switching view re-renders layout without carrying forward view-specific state

- day, week, and month views have structurally different DOM; changing `view` produces a fresh render so residual state from the previous layout cannot persist
  - does switching from month to day view reflect the events in the new layout?

## Day view resolves overlap so simultaneous events don't hide each other

- when events occupy the same time slot they share the horizontal space proportionally; events are never stacked invisibly
  - do two events at the same time render side by side rather than overlapping?

## Date navigation handles year boundaries correctly

**method:** `navigateBackFromJanuary`

- navigating backward from January produces December of the prior year; the calendar does not produce invalid dates at month boundaries
  - navigateBackFromJanuary() captures result → result.month === 11
