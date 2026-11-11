# Calendar

A month, week or day calendar of events, with its own toolbar: previous, Today and next, the period's title, and a Day/Week/Month switch. Reach for it when the view is the calendar; to pick one date in a form, a date Input is the smaller tool. Days, half hours and events press by pointer or keyboard: Tab reaches the grid, the arrow keys (and Home and End) move between cells, and Enter or Space presses one.

## Usage rules

No [usage rule](../../docs/USAGE_RULES.md#every-component) bears on Calendar yet: no app uses it.

## Usage

```js
import { Calendar } from '@vanilla-bean/components';

const calendar = new Calendar({
	view: 'week',
	events: visits.map(visit => ({ at: visit.start, label: visit.title, duration: 60 * 60 * 1000, id: visit.id })),
	onEventPress: ({ detail: { data } }) => openVisit(data.id),
	onDayPress: ({ detail: { date } }) => calendar.goToDay(date),
});
```

## Events on the calendar

Each entry in `events` needs `at` (a Date, timestamp or date string); `label`, `notes`, `color` and `duration` (in milliseconds) are optional. Whatever else the object carries (an id) comes back as `data` when it's pressed. A repeating event sets `recurring`, then either `daily` with `weekdays` (`{ monday: true }`) and `blacklist` dates to skip, or `whitelist`, the dates it falls on. Assign `events` again, or call `addEvent(event)`, to change them.

`setView(view)`, `setDate(year, month, day, true)` (without `true` it sets the date but doesn't redraw), `goToDay(date)`, `today()`, `previous()` and `next()` move it from code; `eventsAt(date)` lists one day's events.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `view` | `'month'\|'week'\|'day'` | `'month'` | The view shown; reactive |
| `views` | `Array<string>` | all three | The views the switch offers |
| `events` | `Array<object>` | `[]` | The events; reactive |
| `year`, `month`, `day` | `number` | today | The date shown; give all three, `month` counting from 0 |
| `display24h` | `boolean` | `false` | 24-hour times in the day view |
| `height` | `string` | `'420px'` | The calendar's height |

## Events

- **`dayPress`** - A day pressed in the month or week view; `event.detail` is `{ date, target, isTitle }`, `isTitle` when its heading (the day's number) was pressed
- **`timePress`** - A half hour pressed in the day view; `event.detail` is `{ date, target }`
- **`eventPress`** - An event pressed, and not also its day; `event.detail` is `{ calendarEvent, data, target }`, `data` the object it was given as
- **`newEvent`** - `addEvent()` added one; `event.detail` is the object added
