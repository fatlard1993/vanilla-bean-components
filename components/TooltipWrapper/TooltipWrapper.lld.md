# TooltipWrapper

> ./TooltipWrapper.js

Component that adds a tooltip to whatever it wraps. The Tooltip is created during the first `_setOption('tooltip', ...)` call — which runs during render — so it exists after construction but is only shown on hover after a 700ms delay.

## The tooltip exists after construction with a tooltip option

- the Tooltip component is created when the `tooltip` option is processed during render; after construction it exists as `this._tooltip`
  - does the Tooltip component exist after construction with a tooltip option?

## Hover shows after a delay — brief mouse-overs do not trigger the tooltip

- pointerover registers a 700ms timer; pointerout cancels it and hides immediately — hovering for longer than 700ms shows the tooltip
  - does hovering for longer than 700ms show the tooltip?
  - does leaving before 700ms prevent the tooltip from appearing?

## Cleanup removes the tooltip element — nothing outlives the component

- when the TooltipWrapper is destroyed, the Tooltip component is also destroyed and removed from the DOM
  - does destroying the wrapper also remove the tooltip from the DOM?
