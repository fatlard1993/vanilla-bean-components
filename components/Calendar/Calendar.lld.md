# Calendar

> ./Calendar.js

Multi-view calendar that renders the same event data differently depending on scale. The key design decision: `view` is an option like any other; changing it triggers a full re-render with the same events laid out for the new context. No view-specific state accumulates.

## Switching view re-renders layout without carrying forward view-specific state

- changing `view` produces a fresh render, so no residual state from the previous layout persists into the new one
  - new Subject({ view: "month", appendTo: document.body }) captures c then c.elem.querySelectorAll("td").length captures monthCells then c.options.view = "week" then await new Promise(r => setTimeout(r, 20)) -> monthCells === 49 && c.elem.querySelectorAll("td").length === 0 && c.elem.classList.contains("week") && !c.elem.classList.contains("month")
  - new Subject({ view: "month", events: [{ at: new Date(), label: "Standup" }], appendTo: document.body }) captures c then (c.elem.textContent.match(/Standup/g) ?? []).length captures inMonth then c.options.view = "day" then await new Promise(r => setTimeout(r, 20)) -> inMonth === 1 && (c.elem.textContent.match(/Standup/g) ?? []).length === 1

## Times read as clock times, and the current day is findable

A 12-hour clock has no hour zero, so midnight is `12:00 AM`; `display24h` opts into the other convention. Whichever is in use, the cell for today is marked so the view has an anchor the reader can find without reading dates.

- in 12-hour mode midnight reads as 12, not 0; `display24h` switches to the 24-hour convention
  - new Subject({ view: "day", year: 2026, month: 0, day: 15, appendTo: document.body }) captures twelve then Array.from(twelve.elem.querySelectorAll("*")).map(e => e.childNodes.length === 1 ? e.textContent : "").filter(t => /^\d{1,2}:\d{2}\s?(AM|PM)$/.test(t)) captures labels then new Subject({ view: "day", display24h: true, year: 2026, month: 0, day: 15, appendTo: document.body }) captures full then Array.from(full.elem.querySelectorAll("*")).map(e => e.childNodes.length === 1 ? e.textContent : "").filter(t => /^\d{1,2}:\d{2}/.test(t)) captures labels24 -> labels[0] === "12:00 AM" && !labels.some(l => l.startsWith("0:")) && labels24[0].startsWith("0:00")
- the cell for the current date carries a marker the other cells do not
  - new Subject({ view: "week", appendTo: document.body }) captures c -> c.elem.querySelectorAll(".today").length === 1
- view and date methods return the calendar so calls can be chained
  - new Subject({ appendTo: document.body }) captures c then c.setView("week") captures returned -> returned === c

## Date input is accepted in whatever form the caller has it

Dates arrive from JSON, from attributes, from other components -- as strings as often as `Date` objects. Queries coerce rather than demanding the caller convert first. Option changes made before the calendar has rendered are recorded without forcing a render, so construction order does not matter.

- `eventsAt` accepts a date string as readily as a `Date`
  - new Subject({ view: "month", year: 2026, month: 0, day: 15, events: [{ at: new Date(2026, 0, 15, 9, 0, 0), label: "Standup" }], appendTo: document.body }) captures c then c.eventsAt(new Date(2026, 0, 15)) captures byDate then c.eventsAt("2026-01-15T12:00:00") captures byString -> byDate.length === 1 && byString.length === 1 && byString[0].label === "Standup"
- setting `view` before the calendar has rendered records the value without rendering; the first render then uses it
  - new Subject({ autoRender: false, view: "month" }) captures c then c.options.view = "week" then c.elem.childNodes.length captures beforeRender then c.render() -> beforeRender === 0 && c.options.view === "week" && c.elem.classList.contains("week")

## Day view resolves overlap so simultaneous events don't hide each other

**browser:** true

- when events occupy the same time slot they share the horizontal space proportionally; events are never stacked invisibly
  - new Subject({ appendTo: document.body, view: "day", year: 2026, month: 0, day: 15, events: [{ at: new Date(2026, 0, 15, 10, 0, 0), duration: 60, label: "one" }, { at: new Date(2026, 0, 15, 10, 0, 0), duration: 60, label: "two" }] }) captures c then await new Promise(r => setTimeout(r, 150)) then Array.from(c.elem.querySelectorAll("div.event")).map(e => e.getBoundingClientRect()) captures boxes -> boxes.length === 2 && boxes[0].width > 0 && boxes[1].width > 0 && boxes[0].right <= boxes[1].left

## Week view anchors on the month the week starts in

A week that straddles a month boundary belongs to the month it began in, so month-by-month navigation lands on whole weeks instead of splitting one across two screens. The re-anchoring is the exception, not the rule: a week sitting entirely inside its month must be left where it is.

- the week shown is the one containing the target date; only a week whose first day falls in the previous month re-anchors there
  - new Subject({ view: "month", appendTo: document.body }) captures c then c.setDate(2026, 7, 4) then c.setView("week") -> c.options.month === 7 && c.options.day === 4 && c.elem.textContent.includes("August 2nd - 8th, 2026")
  - new Subject({ view: "month", appendTo: document.body }) captures c then c.setDate(2026, 7, 1) then c.setView("week") -> c.options.month === 6 && c.options.day === 31 && c.elem.textContent.includes("July 26th - August 1st, 2026")

## Date navigation handles year boundaries correctly

- navigating backward from January produces December of the prior year; the calendar does not produce invalid dates at month boundaries
  - new Subject({ year: 2026, month: 0, day: 15, view: "month" }) captures c then c.previous() -> c.options.month === 11 && c.options.year === 2025

## An event only gives up horizontal space to events it actually overlaps

Sharing the row is a cost paid per collision, not per day: two events at the same hour split the width between them, while an event alone in its hour keeps the full width. Charging every event for the busiest moment of the day would leave most of the column empty.

- events that collide are offset from each other; an event with no collision is not offset at all
  - new Subject({ view: "day", year: 2026, month: 0, day: 15, events: [{ at: new Date(2026, 0, 15, 10, 0, 0), duration: 60, label: "one" }, { at: new Date(2026, 0, 15, 10, 0, 0), duration: 60, label: "two" }, { at: new Date(2026, 0, 15, 14, 0, 0), duration: 60, label: "three" }], appendTo: document.body }) captures c then Array.from(c.elem.querySelectorAll("div.event")).map(e => e.style.left) captures lefts -> lefts.length === 3 && lefts[0] !== lefts[1] && lefts[2] === "0px"
